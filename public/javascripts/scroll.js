document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener('scroll', function () {
        if (window.scrollY > 80) {
            document.getElementById('navbar_top').classList.add('fixed-top');
            navbar_height = document.querySelector('.navbar').offsetHeight;
            document.body.style.paddingTop = navbar_height + 'px';
            document.querySelector('.navbar').style.backgroundColor="#083671";
            document.querySelector('.navbar').style.height="80px";
            document.querySelector('.navbar').style.transition = "all 0.8s";;
            document.querySelector('.navbar-brand span').style.setProperty('color', 'white', 'important');
            document.querySelectorAll('.navbar-nav .nav-link').forEach((function(a){ a.style.setProperty('color', 'white', 'important');}))
        } else {
            document.getElementById('navbar_top').classList.remove('fixed-top');
            document.body.style.paddingTop = '0';
            document.querySelector('.navbar').style.backgroundColor="white"
            document.querySelector('.navbar-brand span').style.setProperty('color', '#295284', 'important');
            document.querySelectorAll('.navbar-nav .nav-link').forEach((function(a){ a.style.setProperty('color', '#295284', 'important');}))

        }
    });
});