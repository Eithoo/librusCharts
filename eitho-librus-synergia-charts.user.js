// ==UserScript==
// @name         Librus - wykresy
// @version      0.1
// @description  naprawia niedziałające wykresy na stronie Librusa
// @homepageURL  https://github.com/Eithoo/librusCharts
// @updateURL    https://github.com/Eithoo/librusCharts/raw/main/eitho-librus-synergia-charts.user.js
// @downloadURL  https://github.com/Eithoo/librusCharts/raw/main/eitho-librus-synergia-charts.user.js
// @supportURL   https://github.com/Eithoo/librusCharts/issues
// @icon         https://synergia.librus.pl/images/synergia.ico
// @author       Eitho
// @match        https://synergia.librus.pl/archiwum
// @grant        GM.xmlHttpRequest
// @require		 https://www.chartjs.org/dist/2.9.4/Chart.min.js
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
	const randomColors = false;
	// false - kolor oparty na nazwie przedmiotów
	// true - kolor losowy, z kilkoma wyjątkami


	// moze dodac tez prosty wykres sredniej?
	// skoro beda juz pobrane dane z archiwum i z biezacego roku to liczenie sredniej nie powinno byc problemem


	Element.prototype.appendBefore = function(element) {
		element.parentNode.insertBefore(this, element);
	};

	Element.prototype.appendAfter = function(element) {
		element.parentNode.insertBefore(this, element.nextSibling);
	};

	Object.defineProperty(Array.prototype, 'chunk', {
		value: function(chunkSize) {
		  var R = [];
		  for (var i = 0; i < this.length; i += chunkSize)
			R.push(this.slice(i, i + chunkSize));
		  return R;
		}
	  });

	function deleteBrokenChart() {
		let oldChartDiv = document.querySelector('#gradeArchiveGraph');
		if (!oldChartDiv) return;
		oldChartDiv.remove();
	}

	function insertChartIntoDOM() {
		const absencesChart = document.querySelector('#gradeAbsencesGraph');
		let mainDiv = document.createElement('div');
			mainDiv.className = 'center';
			mainDiv.style.maxWidth = '75vw';
			mainDiv.style.marginBottom = '5%';
		let title = document.createElement('h3');
			title.className = 'center';
			title.innerText = 'Wykres ocen archiwalnych';
		let graph = document.createElement('canvas');
			graph.id = 'gradeArchiveGraph';
		mainDiv.appendChild(title);
		mainDiv.appendChild(graph);
		mainDiv.appendBefore(absencesChart);
		const y = document.querySelector('#gradeAbsencesGraph').getBoundingClientRect().top + window.scrollY;
		window.scroll({
			top: y,
			behavior: 'smooth'
		  });
	}

	const niceColors = {
		Matematyka: '#990000',
		['Język polski']: '#a31919',
		Religia: '#cbbeb5',
		['Wychowanie fizyczne']: '#000000',
		Informatyka: '#22CECE',
		['Język angielski']: '#059BFF'
	}

	String.prototype.stringToHex = function() {
		var hash = 0;
		if (this.length === 0) return hash;
		for (var i = 0; i < this.length; i++) {
			hash = this.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash;
		}
		var color = '#';
		for (var i = 0; i < 3; i++) {
			var value = (hash >> (i * 8)) & 255;
			color += ('00' + value.toString(16)).substr(-2);
		}
		return color;
	}

	function hslToHex(h, s, l) {
		l /= 100;
		const a = s * Math.min(l, 1 - l) / 100;
		const f = n => {
		  const k = (n + h / 30) % 12;
		  const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		  return Math.round(255 * color).toString(16).padStart(2, '0');
		};
		return `#${f(0)}${f(8)}${f(4)}`;
	}

	function randomDarkColorHSL() {
		var hue = Math.floor(Math.random() * 360),
		saturation =  Math.floor(Math.random() * 100),
		lightness =  Math.floor(Math.random() * 80);
		return {h: hue, s: saturation, l: lightness};
	}

	function randomDarkColor() {
		const {h, s, l} = randomDarkColorHSL();
		return hslToHex(h, s, l);
	}

	
	function getPage(url, dontparse, method) {
		return new Promise(function (resolve, reject) {
			GM.xmlHttpRequest({
				method: method || 'GET',
				timeout: 1000*10,
				url: url,
				onload: function(response) {
					if (dontparse == 'returnall') resolve(response);
					else if (dontparse && dontparse != 'returnall') resolve(response.responseText);
					else {
						var page = new DOMParser().parseFromString(response.responseText, 'text/html');
						resolve(page);
					}
				},
				onerror: function(error){
					reject(error);
				},
				ontimeout: function(error){
					reject(error);
				}
			});
		});
	}

	async function getCurrentGrades() {
		const gradesWholePage = await getPage('https://synergia.librus.pl/przegladaj_oceny/uczen');
		const gradesPage = gradesWholePage ? gradesWholePage.querySelector('#page #body form table.decorated.stretch') : false;
		if (!gradesPage) return false;

		const table = gradesPage.querySelector('table.decorated tbody');
		let semesters = ['BIEŻĄCY ROK | SEM 1', 'BIEŻĄCY ROK | SEM 2'];
		let subjects = [];
		const rows = table.querySelectorAll('tr:not(#przedmioty_zachowanie):not(.bolded)');
		for (const row of rows) {
				if (row.id.includes('przedmioty')) 
					continue;
				
				if (row.parentElement.parentElement != gradesPage) // zabezpieczenie bo geniusze dali tabele w tabeli i nie podpisali inaczej jej
					continue;
				const td = row.querySelectorAll('td');
				const name = td[1].innerText.trim();
				let grades = [+td[5].innerText.trim() || td[5].innerText.trim(), +td[10].innerText.trim() || td[10].innerText.trim()];
				if (JSON.stringify(grades) == JSON.stringify(['-', '-'])) // jesli brak ocen w ogole to prawdopodobnie sie uczen tego nawet nie uczy, zamiana na JSON, bo normalnie nie da sie porownywac array w js
					continue;
				// todo liczenie na podstawie sredniej jesli ocena nie jest wystawiona
				// tu potem do pobierania poszczegolnych ocen zrobic cos w stylu partialGrades: [1, 2, 3, 4, 5, 5, 4, 5, ...]
				subjects.push({label: name, data: grades});
		}
		return {subjects, semesters};
	}

	function getArchiveGrades() {
		const table = document.querySelector('table.decorated');
		let semesters = [];
		let subjects = [];
		const rows = table.querySelectorAll('tr');
		for (const rowIndex in rows) {
			const row = rows[rowIndex];
			if (rowIndex == 0) { // lata
				for (const column of row.querySelectorAll('td')) {
					if (column.colSpan == 3) {
						const text = column.innerText.split('Rok:')[1].trim();
						semesters.push(text + ' | SEM 1');
						semesters.push(text + ' | SEM 2');
					}
				}
			} else if (rowIndex == 1) { // semestry
				// ignore
			} else if (rowIndex > 1) { // przedmioty
				if (!row.querySelector('th') || row.querySelector('th').innerText.trim() == '') // jesli to nie sa przedmioty
					continue;
				const forbidden = ['nieusprawiedlione', 'nieusprawiedliwione', 'usprawiedlione', 'usprawiedliwione', 'spóźnienia']; // podwojnie pisane bo literowki strzelili na stronie librusa
				if (forbidden.find(v => v == row.querySelector('th').innerText.trim()))
					continue;

				const name = row.querySelector('th').innerText.trim();
				let data = [];
				const columns = row.querySelectorAll('td');
				for (const column of columns) {
					let value = column.innerText.trim();
					data.push(+value || value);
				}
				let chunked = data.chunk(3);
				for (let chunk of chunked) {
					if (chunk[1] == '-' && chunk[2] != '-')
						chunk.splice(1, 1);
					if (chunk[1] != '-' && chunk[2] == '-')
						chunk.splice(2, 1);
					if (chunk[1] == '-' && chunk[2] == '-')
						chunk.splice(1, 1);
					if (chunk.length == 3) // jesli nadal sa tam 3 liczby, to znaczy ze byla wystawiona ocena na kazdy semestr i na koniec roku, a ja potrzebuje tylko dwie
						chunk.splice(1, 1);
				}
				subjects.push({label: name, data: chunked});
			}
		}
		return {subjects, semesters};
	}

	function gradesToDatasets(grades) {
		let datasets = [];
		for (const subject of grades.subjects) {
			const color = niceColors[subject.label] || (randomColors == true ? randomDarkColor() : subject.label.stringToHex());
			let dataset = {
				label: subject.label,
				backgroundColor: color + '50',
				borderColor: color + 'AA',
				fill: false,
				pointRadius: 6,
				pointHoverRadius: 13,
			};
			dataset.data = subject.data.join().split(',');
			datasets.push(dataset);
		}
		return datasets;
	}

	deleteBrokenChart();
	insertChartIntoDOM();

	function dealWithDoubledData(archiveDatasets, currentDatasets) {
		if (!archiveDatasets || !currentDatasets) return false;
		let res = [];
		for (const i in archiveDatasets) {
			let archiveDataset = archiveDatasets[i];
			const found = currentDatasets.find(dataset => dataset.label == archiveDataset.label);
			if (found) {
				archiveDatasets[i].data = [...archiveDataset.data, ...found.data];
				res.push(archiveDatasets[i]);
				const index = currentDatasets.indexOf(found);
				currentDatasets.splice(index, 1);
			} else {
				res.push(archiveDatasets[i]);
			}
		}
		res = [...res, ...currentDatasets];
		return res;
	}

	function insertChart() {
		const archiveGrades = getArchiveGrades();
		console.log('archieveGrades', archiveGrades);
		const datasets = gradesToDatasets(archiveGrades);
	//	console.log('archiveDatasets', datasets);
		getCurrentGrades().then(currentGrades => {
			console.log('currentGrades', currentGrades);
			chart.data.labels = [...archiveGrades.semesters, ...currentGrades.semesters];
			const currentDatasets = gradesToDatasets(currentGrades);
		//	console.log('currentDatasets', currentDatasets);
			const mergedDatasets = dealWithDoubledData(datasets, currentDatasets);
			console.log('mergedDatasets', mergedDatasets);
			chart.data.datasets = mergedDatasets;
			chart.update();
		})
		var config = {
			type: 'line',
			data: {
				labels: archiveGrades.semesters,
				datasets
			},
			options: {
				responsive: true,
				legend: {
					position: 'bottom',
					align: 'center'
				},
				hover: {
					mode: 'index'
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Przedmioty'
						},
						stacked: true
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Ocena'
						},
						ticks: {
							stepSize: 1,
							suggestedMin: 1,
							suggestedMax: 6
						},
					//	stacked: true
					// dodac wlaczanie tego na chwile jako opcja, bo to pokazuje wszystkie przedmioty ale za to z lewej nie ma juz normalnych ocen tylko jest 0 - 72
					}]
				}
			}
		};
		const chart = new Chart('gradeArchiveGraph', config);
	}
	insertChart();

})();