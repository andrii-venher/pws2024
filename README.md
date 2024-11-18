# Programming Web Services 2024

## Download/update source code of the project

Create new folder ``pws2024`` with the newest version
```
git clone https://gitlab.com/mariusz.jarocki/pws2024.git
```
Update existing sources to the newest version
```
cd pws2024
git reset
git pull
```

## Dependencies installation
```
npm install
cd pws2024-vue
npm install
```

## Start of the backend
```
npm start
```
The backend should be available at http://localhost:8000
If you would like to use your specific configuration, please copy config-example.json to config.json and customize it.

## Compilation of the frontend for production
```
cd pws2024-vue
npm run build
```

## Start of the frontend development server
```
cd pws2024-vue
npm run dev
```
The server will be available at http://localhost:5173