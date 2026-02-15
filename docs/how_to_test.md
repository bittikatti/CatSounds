# Create in CloudFlare
Infrastructure: CloudFlare

# Worker
1. Create worker for the D1 (only once)
```cmd
npm create cloudflare@latest -- catsounds
```


# D1 database
## Create D1 database
1. Create empty D1 (done only once)
```cmd
npx wrangler@latest d1 create cat-sounds-data
```
## Setup test D1 locally
2. Initiate empty database in D1 locally
```cmd
npx wrangler d1 execute cat-sounds-data --local --file=./database/schema.sql
```

3. Fill the local D1 database with data from seed.sql (not tracked by git)
```cmd
npx wrangler d1 execute cat-sounds-data --local --file=./database/seed.sql
```

4. Check that the data from seed.sql is in the local D1
```cmd
npx wrangler d1 execute cat-sounds-data --local --command="SELECT * FROM CatSounds"
```

## Setup D1 remote
2. Initiate empty database in D1 locally
```cmd
npx wrangler d1 execute cat-sounds-data --remote --file=./database/schema.sql
```
3. Fill the local D1 database with data from seed.sql (not tracked by git)
```cmd
npx wrangler d1 execute cat-sounds-data --remote --file=./database/seed.sql
```

4. Check that the data from seed.sql is in the local D1
```cmd
npx wrangler d1 execute cat-sounds-data --remote --command="SELECT * FROM CatSounds"
```

# R2
## Create R2 storage
1. Create empty R2 (done only once)
```cmd
npx wrangler r2 bucket create sound-files
```

# Start the local tests (in test folder)
npm test

```cmd
npm test
```

## Start dev server

```cmd
npm run dev
```
In browser open:
http://localhost:8787/api/sounds