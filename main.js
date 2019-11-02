function fileExt() {
	return ".tabset";
}

window.onload = function() {
	connectButtons();
}

function connectButtons() {
	var saver = document.getElementById("saveButton");
	var loader = document.getElementById("loadButton");

	var readfileinput = document.getElementById("readfile");
	readfileinput.accept = fileExt();
	readfileinput.onchange = (event => loadFile(event));

	saver.addEventListener("click", saveFcn);
	loader.addEventListener("click", loadFcn);
}

function saveFcn() {
	chrome.windows.getCurrent({'populate': true}, function (win) {
		chrome.tabs.getAllInWindow(win.id, function(tabs) {
			var taburls = [...tabs].map(t => t.url);
			if (taburls.some(u => u == undefined)) {
				alert("At least 1 url is undefined.")
			}
			else {
				saveFile(taburls);

			}
		});
	});
}

function loadFcn() {
	document.getElementById("readfile").click();
}

function loadFile(event) {
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.readAsText(file,"UTF-8");
   	// reader.readAsDataURL(file); // this is reading as data url
   	reader.onload = parseFile;
}

function parseFile(readEvent) {
	var fileValid;
	try {
		var filestr = readEvent.target.result;
		var loadedTabList = JSON.parse(filestr);
		fileValid = loadedTabList.every(x => (typeof(x) === "string"));
	}
	catch (err) {
		fileValid = false;
	}
	if (fileValid) {
		openTabs(loadedTabList);
	}
	else {
		alert("Invalid file selection!");
	}
}


function openTabs(urlarray) {
	chrome.windows.getCurrent({'populate': true}, function (win) {
		chrome.tabs.getAllInWindow(win.id, function (tabs) {
			var taburls = [...tabs].map(t => t.url);
			if ((taburls.length == 1) && (taburls[0] == "chrome://newtab/")) {
				// alert("no tabs open in current");
				chrome.windows.remove(tabs[0].windowId);
			}
			chrome.windows.create({'url': urlarray});
		});
	});

}

function saveFile(urlarray) {
	var s = JSON.stringify(urlarray);
	var anch = document.getElementById("dllink");
	var filename = window.prompt("Save tab file as...");
	if (filename != null) {
		var newfilename = filename.split(".")[0] + fileExt();

		anch.href = 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(s);
		anch.download = newfilename;
		anch.click();
	}
}


