document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("dark-mode-toggle");
    const body = document.body;
  
    // 저장된 모드 확인
    if (localStorage.getItem("dark-mode") === "enabled") {
      body.classList.add("dark-mode");
    }
  
    // 버튼 클릭 시 다크 모드 활성/비활성
    toggleButton.addEventListener("click", function () {
      body.classList.toggle("dark-mode");
  
      if (body.classList.contains("dark-mode")) {
        localStorage.setItem("dark-mode", "enabled");
      } else {
        localStorage.setItem("dark-mode", "disabled");
      }
    });
  });
  