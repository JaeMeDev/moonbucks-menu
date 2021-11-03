import { $ } from "./utils/dom.js";
import MenuAPI from "./api/index.js";

// TODO 서버 요청 부분
// - [x] 웹 서버를 띄운다.
// - [x] 서버에 새로운 메뉴명이 추가될 수 있도록 요청한다.
// - [x] 서버에서 카테고리별 메뉴리스트를 불러온다.
// - [x] 서버에 저장되어 있는 메뉴가 수정될 수 있도록 요청한다.
// - [x] 서버에 메뉴의 품절상태를 Toggle 할 수 있도록 요청한다.
// - [x] 서버에 메뉴가 삭제 될 수 있도록 요청한다.

// TODO 리팩터링
// - [x] localStorage에 저장하는 로직은 지운다.
// - [x] fetch 비동기 api를 사용하는 부분을 async await을 사용하여 구현한다.

// TODO 사용자 경험
// - [x] API 통신이 실패하는 경우에 대해 사용자가 알 수 있게 alert으로 예외처리를 진행한다.
// - [ ] 중복되는 메뉴는 추가할 수 없다.

function App() {
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };
  this.currentCategory = "espresso";
  this.init = async () => {
    initEventListeners();
    render();
  };

  const render = async () => {
    this.menu[this.currentCategory] = await MenuAPI.getAllMenuByCategory(
      this.currentCategory
    );
    $("#menu-list").innerHTML = this.menu[this.currentCategory]
      .map((item) => {
        return `
            <li data-menu-id=${
              item.id
            } class="menu-list-item d-flex items-center py-2">
                <span class="${
                  item.isSoldOut ? "sold-out" : ""
                } w-100 pl-2 menu-name">${item.name}</span>
                <button
                    type="button"
                    class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
                >
                    품절
                </button>
                <button
                    type="button"
                    class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
                >
                    수정
                </button>
                <button
                    type="button"
                    class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
                >
                    삭제
                </button>
            </li>`;
      })
      .join("");
    updateMenuCount();
  };

  const updateMenuCount = () => {
    $(".menu-count").innerText = `총 ${
      this.menu[this.currentCategory].length
    }개`;
  };

  const addMenuName = async () => {
    const menuName = $("#menu-name");

    if (menuName.value === "") {
      alert("값을 입력해주세요.");
      return;
    }

    const duplicatedItem = this.menu[this.currentCategory].find(
      (menuItem) => menuItem.name === menuName.value
    );
    if (duplicatedItem) {
      alert("이미 등록된 메뉴입니다. 다시 입력해주세요.");
      return;
    }

    await MenuAPI.createMenu(this.currentCategory, menuName.value);
    render();
    menuName.value = "";
  };

  const updateMenuName = async (element) => {
    const menuId = element.dataset.menuId;
    const $menuName = element.querySelector(".menu-name");
    const newName = prompt("메뉴를 수정하세요", $menuName.innerText);
    await MenuAPI.updateMenu(this.currentCategory, newName, menuId);
    render();
  };

  const removeMenuName = async (element) => {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }
    const menuId = element.dataset.menuId;
    await MenuAPI.deleteMenu(this.currentCategory, menuId);
    render();
  };

  const soldOutMenu = async (element) => {
    const menuId = element.dataset.menuId;
    await MenuAPI.toggleSoldOutMenu(this.currentCategory, menuId);
    render();
  };

  const changeCategory = (e) => {
    const isCategoryButton = e.target.classList.contains("cafe-category-name");
    if (isCategoryButton) {
      this.currentCategory = e.target.dataset.categoryName;
      $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
      render();
    }
  };

  const initEventListeners = () => {
    $("#menu-list").addEventListener("click", (e) => {
      const $liElement = e.target.closest("li");

      if (e.target.classList.contains("menu-edit-button")) {
        updateMenuName($liElement);
        return;
      }

      if (e.target.classList.contains("menu-remove-button")) {
        removeMenuName($liElement);
        return;
      }

      if (e.target.classList.contains("menu-sold-out-button")) {
        soldOutMenu($liElement);
      }
    });

    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
    });

    $("#menu-submit-button").addEventListener("click", addMenuName);

    $("#menu-name").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") {
        return;
      }
      addMenuName();
    });

    $("nav").addEventListener("click", changeCategory);
  };
}

const app = new App();
app.init();
