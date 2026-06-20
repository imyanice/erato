# erato

record collection scrobbler

## how-to

- Create a Last.FM API account: <https://www.last.fm/api/account/create>,
- Put your Last.FM API key and secret + Discogs key in the `.env`,
- Run `bun scripts/getSessionKey.ts` and follow the instructions,
- Put the created session key in `.env`,
- Optional:
  - open MongoDB to your network and change the credentials,
  - change erato's port in .env,
- `bun run build`
- `./erato` 

![cat](src/assets/cats/cat-2.JPG)
