# Whatsapp Chat Extractor

### How to use:

1. Clone or download this repo
2. Run `npm install`, `yarn` or `pnpm install`
3. Create an .env file with the following content:
```
    DATABASE_URL="PATH_TO_THE_DATABASE_FOLDER"
    WEB_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    FFMPEG_PATH="C:\\ffmpeg\\bin\\ffmpeg.exe"
    API_URL="http://localhost"
    API_PORT=8000
```
4. Run `npx prisma db push` to create the database
5. Run `npx prisma generate` to generate the client
6. Run `yarn dev` to start the server
7. Watch the terminal for the QR code link and scan it with your phone
8. Go to http://localhost:8000 or whatever port you set in the .env file
9. Download (https://chrome.google.com/webstore/detail/aeojmgngnebhbjpncamiplkimkbnmpmk)[this chrome extension] to download the chats
10. Save the page as a complete webpage with the chrome extension