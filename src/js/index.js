// step2 요구사항 구현을 위한 전략
// TODO localStorage Read & Write
// - [x] localStorage 에 데이터를 저장한다.
// - [x] 메뉴 추가, 수정, 삭제
// - [x] localStorage 에 있는 데이터를 읽어온다.
// TODO 카테고리별 메뉴판 관리
// - [x] 에스프레스 메뉴판 관리
// - [x] 프라푸치노 메뉴판 관리
// - [x] 블렌디드 메뉴판 관리
// - [x] 티바나 메뉴판 관리
// - [x] 디저트 메뉴판 관리
// TODO 페이지 접근시 최초 데이터 Read & Rendering
// - [x] 페이지에 최초로 접근할 때는 localStorage 에서 데이터를 불러온다.
// - [x] 에스프레소 메뉴를 페이지에 그려준다.
// TODO 품절관련
// - [x] 품절 버튼을 추가한다.
// - [x] 품절 버튼 클릭 시 localStorage 에 상태값을 설정한다.
// - [x] 클릭이벤트 => 가장 가까운 li 태그의 class 속성에 sold-out 을 추가한다.
import { $ } from "./utils/dom.js";
import { store } from "./store/index.js";

function App() {
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };
  this.currentCategory = "espresso";
  this.init = () => {
    if (store.getLocalStorage()) {
      this.menu = store.getLocalStorage();
    }
    render();
    initEventListeners();
  };

  const render = () => {
    $("#menu-list").innerHTML = this.menu[this.currentCategory]
      .map((item, index) => {
        return `
            <li data-menu-id=${index} class="menu-list-item d-flex items-center py-2">
                <span class="${
                  item.soldOut ? "sold-out" : ""
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

  const addMenuName = () => {
    const menuName = $("#menu-name");

    if (menuName.value === "") {
      alert("값을 입력해주세요.");
      return;
    }

    this.menu[this.currentCategory].push({ name: menuName.value });
    store.setLocalStorage(this.menu);
    render();
    menuName.value = "";
  };

  const updateMenuName = (element) => {
    const menuId = element.dataset.menuId;
    const $menuName = element.querySelector(".menu-name");
    this.menu[this.currentCategory][menuId].name = prompt(
      "메뉴를 수정하세요",
      $menuName.innerText
    );
    store.setLocalStorage(this.menu);
    render();
  };

  const removeMenuName = (element) => {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }
    const menuId = parseInt(element.dataset.menuId);
    this.menu[this.currentCategory].splice(menuId, 1);
    store.setLocalStorage(this.menu);
    render();
  };

  const soldOutMenu = (element) => {
    const menuId = parseInt(element.dataset.menuId);
    this.menu[this.currentCategory][menuId].soldOut =
      !this.menu[this.currentCategory][menuId].soldOut;
    store.setLocalStorage(this.menu);
    render();
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

    $("nav").addEventListener("click", (e) => {
      const isCategoryButton =
        e.target.classList.contains("cafe-category-name");
      if (isCategoryButton) {
        this.currentCategory = e.target.dataset.categoryName;
        $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
        render();
      }
    });
  };
}

const app = new App();
app.init();
