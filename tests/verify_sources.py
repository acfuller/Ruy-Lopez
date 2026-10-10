"""Re-fetch source records, validate metadata, and compare the complete game scores."""
import io,json,zipfile,urllib.request
from pathlib import Path
import chess.pgn
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'research.json').read_text(encoding='utf-8'))
results=[]
for s in data['sources']:
    req=urllib.request.Request(s['url'],headers={'User-Agent':'RuyLopezEducationalResearch/1.0'})
    with urllib.request.urlopen(req,timeout=45) as response:
        body=response.read()
        assert response.status==200
        results.append({'url':s['url'],'status':response.status,'bytes':len(body)})
    for expected in [g for g in data['games'] if g['source']==s['url']]:
        if s['url'].endswith('.zip'):
            z=zipfile.ZipFile(io.BytesIO(body));text=z.read(next(n for n in z.namelist() if n.lower().endswith('.pgn'))).decode('utf-8-sig',errors='replace')
        else:text=body.decode('utf-8-sig',errors='replace')
        stream=io.StringIO(text);found=False
        while (game:=chess.pgn.read_game(stream)) is not None:
            if all(game.headers.get(k)==v for k,v in expected['pgn_headers'].items()):
                assert not game.errors
                board=game.board();san=[]
                for move in game.mainline_moves():
                    assert move in board.legal_moves
                    san.append(board.san(move));board.push(move)
                assert ' '.join(san)==expected['moves'],expected['id']
                results.append({'game':expected['id'],'metadata_match':True,'legal_plies':len(san),'score_match':True});found=True;break
        assert found,expected['id']
(ROOT/'tests/source-results.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
