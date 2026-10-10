import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Chess} from 'chess.js';
import {lines,glossary,lessons,checks} from '../src/content.js';
import {positionAt,tryMove,gradeMove,newProgress,recordPractice} from '../src/core.js';
const research=JSON.parse(readFileSync(new URL('../research.json',import.meta.url)));
test('every named variation and model game replays legally',()=>{
 assert.ok(lines.length>=18); assert.equal(research.games.length,3);
 for(const line of [...lines,...research.games]){const b=positionAt(line.moves,line.moves.split(' ').length);assert.ok(b.fen());}
});
test('opening board, SAN input and illegal moves are reliable',()=>{const b=positionAt('e4 e5 Nf3 Nc6',4); const before=b.fen(); assert.equal(tryMove(b,'Bh6').ok,false);assert.equal(b.fen(),before);assert.equal(tryMove(b,'Bb5').san,'Bb5');assert.equal(b.get('b5').type,'b');});
test('practice separates recommended moves, alternatives and legal detours',()=>{const ex={moves:'e4 e5 Nf3 Nc6 Bb5',alternatives:{Bc4:'Italian: playable, but not the Spanish.'}};assert.equal(gradeMove(ex,'Bb5').kind,'correct');assert.equal(gradeMove(ex,'Bc4').kind,'alternative');assert.equal(gradeMove(ex,'a3').kind,'detour');assert.equal(gradeMove(ex,'Bh6').kind,'illegal');});
test('spaced review records success and misses without duplicated mastery',()=>{let p=newProgress();recordPractice(p,'berlin','detour',1000);assert.equal(p.practice.berlin.misses,1);recordPractice(p,'berlin','correct',1000);assert.ok(p.practice.berlin.due>1000);assert.equal(p.practice.berlin.solved,true);});
test('teaching data includes key concepts and quiz explanations',()=>{for(const t of ['Development','Center','Bishop pair','Pawn structure','Space','King safety','Initiative'])assert.ok(glossary.some(g=>g.term===t));assert.ok(lessons.length>=6);assert.ok(checks.every(q=>q.explanation&&q.options.length>1));});
