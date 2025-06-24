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