(function () {
  if (window.MyWidgetHasLoaded) return;
  window.MyWidgetHasLoaded = true;

  const script = document.createElement('script');
  script.src = 'https://widget-test-ten.vercel.app/widget.bundle.js'; // o JS principal do seu widget
  script.defer = true;
  document.head.appendChild(script);
})();
