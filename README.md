# Programming Web Services 2024

## Final assignment

### Compulsory part (for the grade 3/satisfactory)
Extend the model to include tasks. Each project consists of a set of tasks having a name, a start date and an optional end date (setting it means that the task has been completed) and a set of workers (from persons). The GUI for managing tasks is not a separate navigation item, it can be invoked with a new [Tasks] button inside the dialog for editing a project. The new modal dialog allows adding, editing and deleting tasks from the project. The collection of workers GUI is implemented by multiple selection.

### for 4
New navigation item, "Analysis", available for role 0. The view contains a Gantt diagram of all projects based on their start and end dates. In addition, when one project is selected using the special combobox, a second Gantt diagram is shown for the tasks in the project. In both diagrams, projects and tasks not completed are highlighted and ongoing until the current date.

### for 5
The diagrams in the previous task automatically refresh if someone from another browsing session modifies the relevant data.

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