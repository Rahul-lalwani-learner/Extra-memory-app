## Initialize

1. npm init -y
2. npm install typescript
3. npx tsc --init
4. npm install express 
- everything look good till now but now if you want `to write in typescript you should use the import syntax instead of require syntax

    Now also when you write import express from "express" it will give you error that couldn't find the declaration file for it

    this concept comes from when you write your library you have various files index.ts router.ts

    now, when you publish this you have heard of this npm registory you publish your library code here

    now, in express their is no typescript code or file that does not provide you details about the types of that file like `.d.ts` 

    Now, what to do 
    1. way is to use @ts-ignore this will ignore ts errors but this is not a good way. even you should enforce that no-one have used @ts-ignore in your codebase
    2. do `npm install -d @types/express` -d because you have added them in your dev dependencies since you don't usually need that in production 





------------------------
## AI functionality here 
In this app that we are building if we want to add some kind of AI chatbot or search that will give you result based on the all the contents you have put in your workspace and based on that content you want to give them result 

What should you do it suppose user give you a query `what is LLM` now you can either forward this request diretly to some LLM chat bot or you can first enrich your query by adding some `context` to it like `Userquery - What is LLM + enriching - based on the information like LLM are use in telecom services` now this enriching part like adding context to query and then forwarding it to LLM so that now you can get the result based on some of your context so you can get more relevant information based on your workspace 

now for this enriching how will you find the relevant document or statement to add to this enrching to forward to LLM like you can't your whole database to the query all the time specially when the datbase is large now you want something by which you can search through you database faster to get relevant documents 

there are 2 ways 
1. using some kind of search algorithms or libary like `elastic search` or `eiboiya`, where you dump your data to it and you search your queries using this 
2. `Vector databases and embedding` where you convert all the databased into vector embedding and then you convert your query into the vector and the identify the distance from all the vector and identify the closest now, theoritically this closest vectors will have the most relveant information and then you give your query the text of those vectors and this is how you enrich your query 