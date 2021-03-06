'use strict'
const fs = require('fs');
const http = require('http');
const ejs = require('ejs');
const template = fs.readFileSync('./templates/blog_page.ejs', 'utf8');

function blogPage(entries){
    const values = {entries};
    return ejs.render(template, values);
}

function getEntries(){ //Функция для чтения и разбора текста записи
    const entries = [];
    let entriesRaw = fs.readFileSync('./entries.txt', 'utf8'); //читает данные из файла
    entriesRaw = entriesRaw.split('---'); //разбивате текст на отдельные записи блога
    entriesRaw.map((entryRaw) => {
        const entry = {};
        const lines = entryRaw.split('\n');//разбивает текст записи на строки
        lines.map((line) => { //разбивает строки на свойства entry
            if(line.indexOf('title: ') === 0){
                entry.title = line.replace('title: ', '');
            } else if(line.indexOf('date: ') === 0){
                entry.date = line.replace('date ', '');
            } else{
                entry.body = entry.body || '';
                entry.body += line;
            }
        });
        entries.push(entry);
    });
    return entries;
}

const entries = getEntries();
console.log(entries);

const server = http.createServer((req, res) => {
    const output = blogPage(entries);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(output);
});

server.listen(8000);
