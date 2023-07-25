const floor = document.querySelector(".floor-input");
const lift = document.querySelector(".lift-input");
const createBtn = document.querySelector(".create-btn");
const inputSection = document.querySelector(".input-section");
const liftFloorSection = document.querySelector(".lift-floor-section");
const floorContainer = document.querySelector(".floor-container");
const errorMsg = document.querySelector(".error-msg");
const backButton = document.querySelector(".back-btn");
let liftRequestStore = [];
let liftAvaialbleStatus = {};
let liftFloorMapping = {};

let floorValue, liftValue;

const moveLift = (nearestLift, calcParentTop, floorNum) => {
  liftAvaialbleStatus[nearestLift.id] = false;
  const floorsToPass = Math.abs(floorNum - liftFloorMapping[nearestLift.id]);
  const transitionDuration = floorsToPass * 2;

  nearestLift.style.top = `${calcParentTop}px`;
  nearestLift.style.transition = `top ${transitionDuration}s ease`;

  nearestLift.classList.add("busy");

  setTimeout(() => {
    nearestLift.classList.add("door-open");
    setTimeout(() => {
      nearestLift.classList.remove("door-open");
      setTimeout(() => {
        nearestLift.classList.remove("busy");
        liftAvaialbleStatus[nearestLift.id] = true;

        liftFloorMapping[nearestLift.id] = floorNum;
        if (liftRequestStore.length > 0) {
          let requestedFloor = liftRequestStore.shift();
          let calcFloorNumber = Number(requestedFloor.id.split("-")[1]);
          const calcParentTop = requestedFloor.offsetTop;
          let nearestLift = findNearestIdleLift(calcFloorNumber);
          moveLift(nearestLift, calcParentTop, calcFloorNumber);
        }
      }, 2000);
    }, 2000);
  }, floorsToPass * 2000);
};

const findNearestIdleLift = (floorNum) => {
  const lifts = document.querySelectorAll(".lift");
  let nearestLift;
  let minDistance = Infinity;
  for (let i = 0; i < lifts.length; i++) {
    let floorDiff = 0;
    if (!lifts[i].classList.contains("busy")) {
      floorDiff = Math.abs(floorNum - liftFloorMapping[lifts[i].id]);
      if (minDistance > floorDiff) {
        nearestLift = lifts[i];
        minDistance = floorDiff;
      }
    }
  }
  return nearestLift;
};

const callLift = (event) => {
  const requestedFloor = event.target.parentNode.parentNode;
  const floorNum = Number(requestedFloor.id.split("-")[1]);
  const calcParentTop = requestedFloor.offsetTop;

  let nearestLift;

  let allBusyLifts = Object.values(liftAvaialbleStatus).every(
    (value) => value === false
  );

  if (allBusyLifts) {
    liftRequestStore.push(requestedFloor);
  }

  if (liftRequestStore.length === 0) {
    nearestLift = findNearestIdleLift(floorNum);
    moveLift(nearestLift, calcParentTop, floorNum);
  }
};

const createFloor = (floorNumber) => {
  const floorRow = document.createElement("div");
  floorRow.classList.add("floor-row");
  floorRow.id = `floor-${floorNumber}`;
  const floorInfo = document.createElement("div");
  floorInfo.classList.add("floor-info");

  const upButton = document.createElement("button");
  const floorNum = document.createElement("span");
  const downButton = document.createElement("button");

  upButton.innerText = "Up";
  downButton.innerText = "Down";
  floorNum.innerText = `Floor-${floorNumber}`;

  upButton.addEventListener("click", callLift);
  downButton.addEventListener("click", callLift);

  if (floorNumber > 1 && floorNumber !== floorValue) {
    floorInfo.append(upButton, floorNum, downButton);
  } else if (floorNumber === 1) {
    floorInfo.append(upButton, floorNum);
  } else if (floorNumber === floorValue) {
    floorInfo.append(floorNum, downButton);
  }

  floorRow.appendChild(floorInfo);
  return floorRow;
};

const addFloors = (floorNumber) => {
  const floorRow = createFloor(floorNumber);

  if (floorNumber === 1) {
    const liftContainer = document.createElement("div");
    liftContainer.classList.add("lift-container");
    floorRow.appendChild(liftContainer);
  }
  floorContainer.appendChild(floorRow);
};

const createLift = (liftId) => {
  const lift = document.createElement("div");
  lift.classList.add("lift");

  const leftSide = document.createElement("div");
  const rightSide = document.createElement("div");

  leftSide.classList.add("left-side");
  rightSide.classList.add("right-side");

  lift.id = `lift-${liftId}`;
  lift.style.left = `${liftId * 6}rem`;

  lift.append(leftSide, rightSide);

  liftAvaialbleStatus[lift.id] = true;
  liftFloorMapping[lift.id] = 1;
  return lift;
};

const addLifts = (liftValue) => {
  const liftContainer = document.querySelectorAll(
    ".floor-row:last-child .lift-container"
  );

  const liftContainerTop = liftContainer[0].offsetTop;
  for (let i = 1; i <= liftValue; i++) {
    const lift = createLift(i);
    lift.style.top = `${liftContainerTop}px`;
    liftContainer[0].appendChild(lift);
  }
};

const createLiftLayout = () => {
  floorValue = Number(floor.value);
  liftValue = Number(lift.value);
  if (floorValue <= 0 || liftValue <= 0) {
    errorMsg.textContent = "Please enter values greater than zero";
    return;
  } else if (liftValue > floorValue) {
    errorMsg.textContent = "Please enter number of lifts less than the floors";
    return;
  }
  inputSection.style.display = "none";
  liftFloorSection.style.display = "block";

  for (let i = floorValue; i >= 1; i--) {
    addFloors(i);
  }
  addLifts(liftValue);
};

const goBack = () => {
  inputSection.style.display = "flex";
  liftFloorSection.style.display = "none";
  floorContainer.innerHTML = "";
  liftRequestStore = [];
  liftAvaialbleStatus = {};
  liftFloorMapping = {};
};

backButton.addEventListener("click", goBack);
createBtn.addEventListener("click", createLiftLayout);

floor.addEventListener("keyup", () => (errorMsg.textContent = ""));
lift.addEventListener("keyup", () => (errorMsg.textContent = ""));
