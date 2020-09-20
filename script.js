"use strict";

window.addEventListener("DOMContentLoaded", start);

let hasBeenHacked = false;

let allStudents = [];
let expelledStudents = [];
let prefectStudents = {
  gryffindor: [],
  hufflepuff: [],
  ravenclaw: [],
  slytherin: [],
};
// let gryffindorPrefect = [];
// let hufflepuffPrefect = [];
// let ravenclawPrefect = [];
// let slytherinPrefect = [];
const settings = {
  filterBy: "*",
  sortBy: "firstname",
  sortDir: "asc",
};
const mediaQueryLaptop = window.matchMedia("(min-width: 1024px)");
let expelledTime;
// const mediaQueryMobile = window.matchMedia("min-width: 200px");

//the prototype for alle students
const Student = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  house: "",
  image: "",
  bloodStatus: "",
  expelled: false,
  prefect: false,
  hacker: false,
};

function start() {
  loadJSON("https://petlatkea.dk/2020/hogwarts/students.json", prepareData);
  loadJSON(
    "https://petlatkea.dk/2020/hogwarts/families.json",
    prepareBloodStatus
  );

  mediaQueryLaptop.addListener(mediaQueryCheck);
  registerButtons();
}

function mediaQueryCheck(mediaQueryLaptop) {
  if (mediaQueryLaptop.matches) {
    // If media query matches
    // document.querySelector(".burger_menu").classList.remove("hidden");
    document.querySelector("#sorting").classList.add("hide");
  }
}

function registerButtons() {
  document.querySelector("#hat").addEventListener("click", () => {
    document.querySelector(".sort-paper").classList.toggle("sorting-move");
  });

  document.querySelector("#sorting .close").addEventListener("click", () => {
    document.querySelector(".sort-paper").classList.toggle("sorting-move");
  });

  document.querySelectorAll("[data-action='sort']").forEach((button) => {
    button.addEventListener("click", selectSorting);
  });

  document
    .querySelector("[data-action='prefect']")
    .addEventListener("click", selectPrefects);

  document.querySelector("#house").addEventListener("change", selectFilter);
  document
    .querySelector("[data-action='expel']")
    .addEventListener("click", selectExpelledStudents);
}

function loadJSON(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => {
      callback(jsonData);
    });
}

function prepareBloodStatus(families) {
  allStudents.forEach((student) => {
    if (families.pure.includes(student.lastName)) {
      student.bloodStatus = "Pureblood";
    } else if (families.half.includes(student.lastName)) {
      student.bloodStatus = "Halfblood";
    } else {
      student.bloodStatus = "Muggleborn";
    }
  });
}

function prepareData(data) {
  data.forEach((jsonObject) => {
    const student = Object.create(Student);

    //firstName
    if (jsonObject.fullname.includes(" ")) {
      student.firstName = jsonObject.fullname
        .trim()
        .substring(0, jsonObject.fullname.trim().indexOf(" "));
    } else {
      student.firstName = jsonObject.fullname.trim().substring("");
    }

    student.firstName =
      student.firstName.substring(0, 1).toUpperCase() +
      student.firstName.substring(1).toLowerCase();

    //middleName
    if (jsonObject.fullname.includes('"')) {
      student.middleName = "";
    } else if (jsonObject.fullname.includes(" ")) {
      student.middleName = jsonObject.fullname
        .trim()
        .substring(
          jsonObject.fullname.trim().indexOf(" ") + 1,
          jsonObject.fullname.trim().lastIndexOf(" ") + 1
        );
    } else {
      student.middleName = "";
    }

    student.middleName =
      student.middleName.trimEnd().substring(0, 1).toUpperCase() +
      student.middleName.trimEnd().substring(1).toLowerCase();

    //lastName
    if (jsonObject.fullname.includes("-")) {
      student.lastName = jsonObject.fullname.substring(
        jsonObject.fullname.lastIndexOf(" ") + 1
      );
    } else if (jsonObject.fullname.includes(" ")) {
      student.lastName = jsonObject.fullname
        .trim()
        .substring(jsonObject.fullname.trim().lastIndexOf(" ") + 1);

      student.lastName =
        student.lastName.substring(0, 1).toUpperCase() +
        student.lastName.substring(1).toLowerCase();
    } else {
      student.lastName = "";
    }

    //nickName
    student.nickName = jsonObject.fullname.substring(
      jsonObject.fullname.indexOf('"') + 1,
      jsonObject.fullname.lastIndexOf('"')
    );

    //house
    student.house =
      jsonObject.house.trim().substring(0, 1).toUpperCase() +
      jsonObject.house.trim().substring(1).toLowerCase();

    //images
    const fileLastName = student.lastName.toLowerCase();
    const fileFirstName = student.firstName.toLowerCase();
    const firstCharName = student.firstName[0].toLowerCase();

    if (fileLastName.includes("-")) {
      student.image =
        fileLastName.substring(fileLastName.indexOf("-") + 1) +
        "_" +
        firstCharName +
        ".png";
    } else if (jsonObject.fullname.includes("Patil")) {
      student.image = `${fileLastName}_${fileFirstName}.png`;
    } else if (jsonObject.fullname.includes(" ")) {
      student.image = `${fileLastName}_${firstCharName}.png`;
    } else {
      student.image = `none_picture.png`;
    }

    student.bloodStatus = "Unknown";
    student.hacker = false;

    // console.table(student);
    allStudents.push(student);
  });
  ShowStudents(allStudents);
  //   buildList();
}

function selectExpelledStudents() {
  const showExpelled = this.dataset.show;

  if (showExpelled === "expelled") {
    this.dataset.show = "unexpelled";
    this.textContent = "Unexpelled students";
    ShowStudents(expelledStudents);
  } else {
    this.dataset.show = "expelled";
    this.textContent = "Expelled students";
    ShowStudents(allStudents);
  }
  //   console.log(`User selected ${showExpelled}`);
}

function selectPrefects() {
  let prefectList = allStudents;
  const showPrefects = this.dataset.show;
  if (showPrefects === "prefects") {
    this.dataset.show = "nonprefects";
    this.textContent = "Nonprefects";
    prefectList = allStudents.filter(isPrefect);
    ShowStudents(prefectList);
  } else {
    this.dataset.show = "prefects";
    this.textContent = "Prefects";
    ShowStudents(prefectList);
  }
}

function selectFilter() {
  const filter = this.value;
  console.log(`User selected ${filter}`);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList() {
  let filteredList = allStudents;

  if (settings.filterBy === "gryffindor") {
    filteredList = allStudents.filter(isGryffindor);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(isHufflepuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(isRavenclaw);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(isSlytherin);
  }
  return filteredList;
}

function isPrefect(student) {
  if (student.prefect === true) {
    return true;
  } else {
    return false;
  }
}

function isGryffindor(student) {
  if (student.house === "Gryffindor") {
    return true;
  } else {
    return false;
  }
}

function isHufflepuff(student) {
  if (student.house === "Hufflepuff") {
    return true;
  } else {
    return false;
  }
}

function isRavenclaw(student) {
  if (student.house === "Ravenclaw") {
    return true;
  } else {
    return false;
  }
}

function isSlytherin(student) {
  if (student.house === "Slytherin") {
    return true;
  } else {
    return false;
  }
}

function selectSorting() {
  const sortBy = this.dataset.sort;
  const sortDir = this.dataset.sortDirection;

  if (sortDir === "asc") {
    this.dataset.sortDirection = "desc";
  } else {
    this.dataset.sortDirection = "asc";
  }
  console.log(`User selected ${sortBy} ${sortDir}`);
  setSorting(sortBy, sortDir);
}

function setSorting(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortingList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function buildList() {
  const currentList = filterList();
  const sortedList = sortingList(currentList);
  ShowStudents(sortedList);
  clearTimeout(expelledTime);
}

function ShowStudents(allStudents) {
  const container = document.querySelector("#student_list");
  const studentTemplate = document.querySelector("template");

  if (allStudents.length == 1) {
    document.querySelector(
      ".student-counter"
    ).textContent = `Showing ${allStudents.length} student`;
  } else {
    document.querySelector(
      ".student-counter"
    ).textContent = `Showing ${allStudents.length} students`;
  }

  container.innerHTML = "";

  allStudents.forEach((student) => {
    const klon = studentTemplate.cloneNode(true).content;

    klon.querySelector(
      ".fullname"
    ).textContent = `${student.firstName} ${student.lastName}`;
    klon.querySelector(".house").textContent = `${student.house}`;
    klon
      .querySelector("ul")
      .addEventListener("click", () => showDetails(student));
    container.appendChild(klon);
  });
}

function showDetails(student) {
  document.querySelector("#details").classList.remove("hide");
  document.querySelector("#details .close").addEventListener("click", () => {
    document.querySelector("#details").classList.add("hide");
    document
      .querySelector(".expel-button")
      .removeEventListener("click", clickExpelButton);
    document
      .querySelector(".prefect-button")
      .removeEventListener("click", makePrefect);
    document
      .querySelector(".prefect-button")
      .removeEventListener("click", removePrefect);
  });

  document.querySelector(
    ".pop-up_fullname"
  ).textContent = `${student.firstName} ${student.middleName} ${student.lastName}`;
  document.querySelector(".student-image").src = `images/${student.image}`;
  document.querySelector(
    ".prefect-emblem"
  ).src = `svg/${student.house}-prefect.svg`;
  document.querySelector(".pop-up_firstname").textContent = student.firstName;
  document.querySelector(".pop-up_middlename").textContent = student.middleName;
  document.querySelector(".pop-up_lastname").textContent = student.lastName;
  document.querySelector(".pop-up_nickname").textContent = student.nickName;
  document.querySelector(".pop-up_house").textContent = student.house;
  document.querySelector(".pop-up_bloodstatus").textContent =
    student.bloodStatus;
  document.querySelector(
    ".house-banner"
  ).src = `svg/${student.house}-banner.svg`;

  //EXPELLED
  if (student.expelled === true) {
    document
      .querySelector(".expelled-stamp-container")
      .classList.add("expelled-scale");
    document.querySelector(".expelled-stamp").classList.remove("hide");
    document.querySelector(".pop-up_buttons").style.display = "none";
    expelledTime = setTimeout(function () {
      document.querySelector("#details").classList.add("hide");
    }, 1700);
  } else {
    document
      .querySelector(".expelled-stamp-container")
      .classList.remove("expelled-scale");
    document.querySelector(".expelled-stamp").classList.add("hide");
    document.querySelector(".pop-up_buttons").style.display = "flex";
    document.querySelector(".expel-button").textContent = "Expel";
  }

  // removes the animation class expelled-scale, so it stays on when you open up an expelled student
  if (
    document.querySelector("[data-action='expel']").dataset.show ===
    "unexpelled"
  ) {
    document
      .querySelector(".expelled-stamp-container")
      .classList.remove("expelled-scale");
    clearTimeout(expelledTime);
  }

  if (student.hacker === true) {
    document
      .querySelector(".expel-button")
      .addEventListener("click", clickExpelButton);
  } else if (student.expelled === false && student.prefect === false) {
    document
      .querySelector(".expel-button")
      .addEventListener("click", clickExpelButton);
  }

  function clickExpelButton() {
    document
      .querySelector(".expel-button")
      .removeEventListener("click", clickExpelButton);
    document
      .querySelector(".prefect-button")
      .removeEventListener("click", makePrefect);
    document
      .querySelector(".prefect-button")
      .removeEventListener("click", removePrefect);

    if (student.hacker === true) {
      console.log("hacker");
      location.href = "heck_no.html";
      student.expelled = false;
    } else if (student.hacker === false) {
      if (student.expelled === true) {
        student.expelled = false;
      } else {
        student.expelled = true;
      }
    }
    allStudents.splice(allStudents.indexOf(student), 1);
    expelledStudents.push(student);
    console.log(expelledStudents);
    buildList();
    showDetails(student);
  }

  //PREFECT
  if (student.prefect === true) {
    document.querySelector(".prefect-emblem").classList.remove("hide");
    document.querySelector(".prefect-button").textContent = "Remove prefect";
    document
      .querySelector(".prefect-button")
      .addEventListener("click", removePrefect);
  } else {
    document.querySelector(".prefect-emblem").classList.add("hide");
    document.querySelector(".prefect-button").textContent = "Become prefect";
    document
      .querySelector(".prefect-button")
      .addEventListener("click", makePrefect);
  }

  function removePrefect() {
    document
      .querySelector(".prefect-button")
      .removeEventListener("click", makePrefect);
    document
      .querySelector(".prefect-button")
      .removeEventListener("click", removePrefect);
    document
      .querySelector(".expel-button")
      .removeEventListener("click", clickExpelButton);

    let prefectArray = [];

    if (student.house === "Gryffindor") {
      prefectArray = prefectStudents.gryffindor;
    } else if (student.house === "Hufflepuff") {
      prefectArray = prefectStudents.hufflepuff;
    } else if (student.house === "Ravenclaw") {
      prefectArray = prefectStudents.ravenclaw;
    } else if (student.house === "Slytherin") {
      prefectArray = prefectStudents.slytherin;
    }

    prefectArray.splice(prefectArray.indexOf(student), 1);
    student.prefect = false;
    buildList();
    showDetails(student);
  }

  function makePrefect() {
    console.log("click prefect");
    document
      .querySelector(".prefect-button")
      .removeEventListener("click", makePrefect);
    document
      .querySelector(".prefect-button")
      .removeEventListener("click", removePrefect);
    document
      .querySelector(".expel-button")
      .removeEventListener("click", clickExpelButton);

    let prefectArray = [];

    if (student.house === "Gryffindor") {
      prefectArray = prefectStudents.gryffindor;
    } else if (student.house === "Hufflepuff") {
      prefectArray = prefectStudents.hufflepuff;
    } else if (student.house === "Ravenclaw") {
      prefectArray = prefectStudents.ravenclaw;
    } else if (student.house === "Slytherin") {
      prefectArray = prefectStudents.slytherin;
    }

    if (prefectArray.length < 2) {
      student.prefect = true;
      prefectArray.push(student);
      showDetails(student);
      buildList();
    } else if (prefectArray.length > 1) {
      removeOnePrefect(student, prefectArray);
    }
  }

  function removeOnePrefect(student, prefectArray) {
    //remove hide from pop up to choose even 1 or 2
    document.querySelector("#warning").classList.remove("hide");

    const button1 = document.querySelector(".button1");
    const button2 = document.querySelector(".button2");

    document.querySelector(
      ".button1 img"
    ).src = `images/${prefectArray[0].image}`;
    document.querySelector(
      ".button2 img"
    ).src = `images/${prefectArray[1].image}`;
    document.querySelector(".student1").textContent = prefectArray[0].firstName;
    document.querySelector(".student2").textContent = prefectArray[1].firstName;

    button1.addEventListener("click", removeStudent1);
    button2.addEventListener("click", removeStudent2);

    function removeStudent1() {
      replacePrefect(prefectArray, student, prefectArray[0]);
    }

    function removeStudent2() {
      replacePrefect(prefectArray, student, prefectArray[1]);
    }
  }

  function replacePrefect(prefectArray, student, studentToReplace) {
    prefectArray.splice(prefectArray.indexOf(studentToReplace), 1);
    prefectArray.push(student);

    studentToReplace.prefect = false;
    student.prefect = true;

    //add hide to pop up for fluf
    document.querySelector("#warning").classList.add("hide");

    showDetails(student);
    buildList();
  }
}

function hackTheSystem() {
  hasBeenHacked = true;
  document.querySelector("#hat").classList.add("rotate");

  //inject myself
  //- create an object from the student prototype
  //- push it to allStudents
  let myself = Object.create(Student);

  myself = {
    firstName: "Kristina",
    lastName: "Andersen",
    middleName: "Perlt",
    nickName: "Kris",
    house: "Gryffindor",
    image: "none_picture.png",
    bloodStatus: "Halfblood",
    expelled: false,
    hacker: true,
  };

  allStudents.unshift(myself);
  ShowStudents(allStudents);

  //randomize blood-statuses
  allStudents.forEach((student) => {
    if (student.bloodStatus === "Pureblood" || student.house === "Slytherin") {
      const values = ["Pureblood", "Halfblood", "Muggleborn"];

      //   const random = Math.floor(Math.random() * values.length);
      student.bloodStatus = values[Math.floor(Math.random() * values.length)];
    } else {
      student.bloodStatus = "Pureblood";
    }
  });
}

// function addToSquad(student) {
//   if (hasBeenHacked) {
//     setTimeout(removeFromSquad, 2000, student);
//   }
// }

// function removeFromSquad(student) {}
