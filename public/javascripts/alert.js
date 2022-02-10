const alert = document.getElementById("myalert");
if(alert){
  alert.style.display = "block";
  setTimeout(function () {
    alert.style.display = "none";
  }, 5000);
}
