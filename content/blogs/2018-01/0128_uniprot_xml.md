---
Title:     Read UniProtKB in XML format
Slug:      read-uniprotkb-xml
Date:      2018-01-28
Tags:      en, python, uniprot
Category:  Bioinfo
---

UniProt Knowledge Base ([UniProtKB]) provides [various methods][uniprot-api] to access their data. I settled on their XML format since no additional parsing code is required and the format is well defined, which comes with a schema. Plus, it turns out that databases such as [PDB][PDBML] also provide their data export in XML format and the corresponding schema so the method can be applied elsewhere. 

Here I will show how to read XML with its schema in Python using [xmlschema].

[UniProtKB]: http://www.uniprot.org/help/uniprotkb
[uniprot-api]: https://www.uniprot.org/help/programmatic_access
[PDBML]: http://pdbml.pdb.org/
[xmlschema]: https://pypi.org/project/xmlschema/

[TOC]


## Other ways to read UniProtKB data in bulk
UniProtKB at least provides REST, SPARQL, XML, and a flat text file for its data access. 

RESTful APIs work very well to access a small proportion of data and usually are my way to go for data access, but it will put too much load on the server if I want a lot of information from tens of thousands of entries. Ideally, UniProtKB's data won't change very often so I'd like to hit the database once per entry and cache the results locally. 

[SPARQL] is kind of similar to REST but can directly query on UniProtKB's [RDF] file, thus one can retrieve whatever information available in a complex way. I started my research on this method but I got overwhelmed by the technical details and eventually gave up. I feel like more tutorials or examples on how to access the SPARQL interface will be very helpful.

UniProtKB's flat text file has been a popular way to parse its data. I mean, it has [its own manual][uniprot-flat-manual], and one can download a full entry's data easily. But this requires writing a custom parser in Python. More code means more bugs, and I will worry about whether my parser works every time UniProt updates.

[SPARQL]: https://en.wikipedia.org/wiki/SPARQL
[RDF]: https://en.wikipedia.org/wiki/Resource_Description_Framework
[uniprot-flat-manual]: https://www.uniprot.org/docs/userman.htm


## XML and XML schema
XML data are structured. For example, this is what entry [P51587] looks like in XML format:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<uniprot xmlns="http://uniprot.org/uniprot" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://uniprot.org/uniprot http://www.uniprot.org/support/docs/uniprot.xsd">
<entry dataset="Swiss-Prot" created="1996-10-01" modified="2017-12-20" version="201">
<accession>P51587</accession>
<accession>O00183</accession>
<accession>O15008</accession>
<accession>Q13879</accession>
<accession>Q5TBJ7</accession>
<name>BRCA2_HUMAN</name>
<protein>
<recommendedName>
<fullName>Breast cancer type 2 susceptibility protein</fullName>
</recommendedName>
<alternativeName>
<fullName>Fanconi anemia group D1 protein</fullName>
</alternativeName>
</protein>
<!-- ...  -->
</entry>
</uniprot>
```

The file is available at <https://www.uniprot.org/uniprot/P04637.xml>. Basically, all the information about this entry should be available in this file, as long as one knows how to query the XML via [XPath]. However, I find XML file harder to read alone, especially without any guide of how the file was constructed.

UniProt XML is constructed based on its XML schema, available as an XSD file at <http://www.uniprot.org/support/docs/uniprot.xsd>. The schema not only helps understand the XML content, it also validates whether the XML is valid. In other words, since all UniProt XMLs are validated by its schema, one can expect to parse all their data the same as what the schema has defined. XML schema is also part of the [W3C standard] and wildly used.

[P51587]: https://www.uniprot.org/uniprot/P51587
[XPath]: https://en.wikipedia.org/wiki/XPath
[W3C standard]: https://www.w3.org/XML/Schema


## Read UniProt XML by xmlschema
I use [xmlschema] to read XML with its schema in Python. Instead of using XPath, one can actually convert the XML content into a dictionary-like format, which can be easily passed to other Python functions.

Using same entry [P51587] as an example,

```pycon
>>> import xmlschema
>>> schema = xmlschema.XMLSchema('https://www.uniprot.org/docs/uniprot.xsd')
>>> entry_dict = schema.to_dict('./P51587.xml')
>>> entry_dict.keys()
dict_keys(['@xsi:schemaLocation', 'entry', 'copyright'])
>>> content = entry_dict['entry'][0]
>>> list(content)[:6]
['@dataset', '@created', '@modified', '@version', 'accession', 'name']
```

I don't need any custom code to read the XML content structurally. For example, to get all the accession IDs of this entry,

```pycon
>>> content['accession']
['P51587', 'O00183', 'O15008', 'Q13879', 'Q5TBJ7']
```

To get the protein names,

```pycon
>>> content['protein']
{'alternativeName': [{'fullName': 'Fanconi anemia group D1 protein'}],
 'recommendedName': {'fullName': 'Breast cancer type 2 susceptibility protein'}}
```

One can compare the dictionary converted result with the original XML. I'd like to end the demo with a more complicated example that finds all the sequence variants:

```pycon
>>> seq_variants = filter(
...     lambda d: d['@type'] == 'sequence variant' and 'variation' in d,
...     content['feature'])
>>> [(d['location']['position']['@position'], 
...   d['original'], d['variation'][0])
...   for d in seq_variants][:10]
[(25, 'G', 'R'),
 (31, 'W', 'C'),
 (31, 'W', 'R'),
 (32, 'F', 'L'),
 (42, 'Y', 'C'),
 (53, 'K', 'R'),
 (60, 'N', 'S'),
 (64, 'T', 'I'),
 (75, 'A', 'P'),
 (81, 'F', 'L')]
```


## Summary
Using UniProt's XML and its schema can read all the data in a structured fashion without a custom parser. Once downloading the XML files of interest, one could basically query everything locally, which is very helpful to retrieve substantial information from UniProt, say, extracting all the citations for certain protein feature.

XML schema really helps users to understand the data structure and it also helps the database developers validate their data export. I hope someday all the databases should have this validation enforced.

However, one may find XML format tedious and not human-friendly to read. JSON has been popular and used heavily by RESTful APIs. The specification of [JSON schema][json-schema] exists, but it is not a W3C standard yet. 

SPARQL and RDF, part of the attempt for the Semantic web can be a universal query interface solving the same problem more elegantly, though the entry level is a bit high with limited learning resources available.

For now, reading bulk data in XML with its schema seems to be the mature way to go with abundant support.


[json-schema]: http://json-schema.org/
