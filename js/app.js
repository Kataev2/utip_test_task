'use strict'

window.onload = () => {
  checkDataSave(TABLE_TEAMPLATE_CLASSES.wrapper, TABLE_TEAMPLATE_CLASSES.header);
  uploadDataHandler(TABLE_TEAMPLATE_CLASSES.btnUpload, TABLE_TEAMPLATE_CLASSES.wrapper, TABLE_TEAMPLATE_CLASSES.overlay, TABLE_TEAMPLATE_CLASSES.header);
  clearDataHandler(TABLE_TEAMPLATE_CLASSES.btnCLean, TABLE_TEAMPLATE_CLASSES.wrapper, TABLE_TEAMPLATE_CLASSES.row, TABLE_TEAMPLATE_CLASSES.header);
}

const TABLE_TEAMPLATE_CLASSES = {
  wrapper: '.table__wrapper',
  header: '.table__header',
  row: '.table__row',
  overlay: '.table__overlay',
  column: '.table__header-item',
  btnUpload: '.table__btn_upload',
  btnCLean: '.table__btn_clean',
  btnDelete: '.table__btn_delete'
};

const keyList = ['name', 'height', 'mass', 'hair_color', 'skin_color'];
let rows = [];
let data = [];


// ---- Data ----

async function getData(url) {
  const response = await fetch(url);

  return await response.json();
}

function uploadDataHandler(btn, wrapper, over, header) {
  const uploadButton = document.querySelector(btn);
  const overlay = document.querySelector(over);

  uploadButton.addEventListener('click', () => {
    overlay.classList.add('js-active');

    getData('https://swapi.dev/api/people')
      .then((response) => {
        const result = response.results.map((item, index) => {
          item.id = index;

          return item;
        });

        data = [...data, ...result]; 
        
        if (data.length > 0) {
          setDataLocalStorage('data', 'people');
          buildTable(data, wrapper, header, TABLE_TEAMPLATE_CLASSES.row);
          sortTable(TABLE_TEAMPLATE_CLASSES.column);

          setTimeout(() => {
            overlay.classList.remove('js-active');
          }, 600);
        }
      });
  });
};


function clearDataHandler(btn, wrapper, row, header) {
  const tableWrapper = document.querySelector(wrapper);
  const tableHeader = document.querySelector(header);
  const clearButton = document.querySelector(btn);
 
  clearButton.addEventListener('click', () => {
    const rowsTable = document.querySelectorAll(row);

    data = [];

    localStorage.removeItem('data');
    tableWrapper.classList.remove('js-upload');
    tableHeader.classList.remove('offset');

    removeRows(rowsTable);
  })
}

// ---- LocalStorage ----

function checkDataSave(wrapper, header) { 
  if(localStorage.getItem('data')) {
    getDataLocalStorage('data', 'people');
    buildTable(data, wrapper, header, TABLE_TEAMPLATE_CLASSES.row);
    sortTable(TABLE_TEAMPLATE_CLASSES.column);
  } 
}

function getDataLocalStorage(key, param) {
  data = JSON.parse(localStorage.getItem(key))[param];
};

function setDataLocalStorage(key, param) {
  localStorage.setItem(key, JSON.stringify({[param]: data}));
};

// ---- Table ----

function buildTable(data, wrapper, header, row)  {
  const tableWrapper = document.querySelector(wrapper);
  const tableHeader = document.querySelector(header);
  const rowsTable = document.querySelectorAll(row);

  const templateButton = 
    `
    <button class="table__btn_delete">
      <img src="img/close.png" alt="">
    </button>
    `;
  
  tableWrapper.classList.add('js-upload');

  if(data.length > 10) {
    tableHeader.classList.add('offset');
  };

  removeRows(rowsTable);

  data.forEach(people => {
    const template = document.createElement('div');

    template.classList = 'table__row';
    template.setAttribute('data-id', people.id);

    for (let peopleKey in people) {
      const filteredKeyList = keyList.filter(key => key === peopleKey);
       
      if (filteredKeyList.length > 0) {
        const templateItem = `<span>${people[peopleKey]}</span>`;

        template.innerHTML += templateItem;
      };
    };

    template.innerHTML += templateButton;

    tableWrapper.append(template);
  });

  rowHandler(TABLE_TEAMPLATE_CLASSES.row, TABLE_TEAMPLATE_CLASSES.btnDelete);
}

function removeRows(rowArray) {
  rowArray.forEach(row => {
    row.classList.add('js-remove');
   
    row.remove();
  });
};

function rowHandler(row, del) {
  const rowArray = document.querySelectorAll(row);

  rowArray.forEach(row => {
    const deleteButton = row.querySelector(del);
    const rowId = row.getAttribute('data-id')

    deleteButton.addEventListener('click', () => {
      deleteRow(row, rowId);
    });
  });
}

function deleteRow(row, id) {
  row.classList.add('js-remove');

  setTimeout(() => {
    row.remove();
  }, 400);
 

  const index = data.map(people => {
    return people.id
  }).indexOf(+id);

  data.splice(index, 1);

  setDataLocalStorage('data', 'people');
};

function sortTable(btn) {
  const sortButtons = document.querySelectorAll(btn);

  sortButtons.forEach(sortButton => {
    sortButton.addEventListener('click', () => {
      const attribute = sortButton.getAttribute('data-sort');
      const direction = sortButton.classList.contains('js-asc') ? false : true;

      sortButtons.forEach(btn => {
        btn.classList.remove('js-asc');
        btn.classList.remove('js-desc');
      });

      if (direction) {
        sortButton.classList.add('js-asc');
        sortButton.classList.remove('js-desc');
      } else {
        sortButton.classList.add('js-desc');
        sortButton.classList.remove('js-asc');
      };

      data.sort((cellA, cellB) => {
        const a = isNaN(cellA[attribute]) ? cellA[attribute] : +cellB[attribute];
        const b = isNaN(cellB[attribute]) ? cellB[attribute] : +cellA[attribute];

        switch (true) {
          case a > b: return 1;
          case a < b: return -1;
          case a === b: return 0;
        }
      });

      if (!direction) data.reverse();

      buildTable(data, TABLE_TEAMPLATE_CLASSES.wrapper, TABLE_TEAMPLATE_CLASSES.header, TABLE_TEAMPLATE_CLASSES.row);
    });
  });
};
