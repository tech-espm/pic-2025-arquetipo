"use strict";

// 1.0.3

if (window.currentLanguageId === 1) {
	window.tableLanguage = {
		emptyTable: "Nothing to show \uD83D\uDE22",
		info: "Showing _START_ to _END_ of _TOTAL_ entries",
		infoEmpty: "Showing 0 itens",
		infoFiltered: "(filtered from _MAX_ total entries)",
		infoPostFix: "",
		thousands: ",",
		lengthMenu: "Show _MENU_ entries per page",
		loadingRecords: "Loading...",
		processing: "Processing...",
		search: "Filter:",
		zeroRecords: "No matching entries found \uD83D\uDE22",
		paginate: {
			first: "First",
			last: "Last",
			previous: '<i class="fa fa-angle-left">',
			next: '<i class="fa fa-angle-right">'
		},
		aria: {
			sortAscending: ": click to sort column ascending",
			sortDescending: ": click to sort column descending"
		}
	};
} else {
	window.tableLanguage = {
		emptyTable: "Nada para exibir \uD83D\uDE22",
		info: "Exibindo itens _START_ até _END_ de _TOTAL_",
		infoEmpty: "Exibindo 0 itens",
		infoFiltered: "(filtrado de _MAX_ itens no total)",
		infoPostFix: "",
		thousands: ".",
		lengthMenu: "Exibir _MENU_ itens por página",
		loadingRecords: "Carregando...",
		processing: "Processando...",
		search: "Filtro:",
		zeroRecords: "O filtro não retornou resultados \uD83D\uDE22",
		paginate: {
			first: "Primeira",
			last: "Última",
			previous: '<i class="fa fa-angle-left">',
			next: '<i class="fa fa-angle-right">'
		},
		aria: {
			sortAscending: ": clique para ordenar de modo crescente",
			sortDescending: ": clique para ordenar de modo decrescente"
		}
	};
}

$.fn.dataTable.ext.type.order["customcurrency-pre"] = function (d) {
	var n = parseFloat(d.replace(/[^0-9-]+/g, '').replace(',', '.'));
	return (isNaN(n) ? -2147483648 : n);
};

$.fn.dataTable.ext.type.order["customtime-pre"] = function (d) {
	if (!d)
		return -2147483648;
	var n = parseInt(d.replace(":", ""));
	return (isNaN(n) ? -2147483648 : n);
};

$.fn.dataTable.ext.type.order["customnumberstr-pre"] = function (d) {
	if (!d)
		return -2147483648;
	var n = parseFloat(d.replace(",", "."));
	return (isNaN(n) ? -2147483648 : n);
};

$.fn.dataTable.ext.type.order["customdate-pre"] = (window.currentLanguageId === 1 ? function (d) {
	if (!d)
		return -2147483648;
	var s, s2, year, month, day;
	if ((s = d.indexOf(">")) > 0)
		d = d.substring(s + 1, d.lastIndexOf("<"));
	s = d.indexOf("/");
	s2 = d.lastIndexOf("/");
	if (s <= 0 || s2 <= s)
		return -2147483648;
	year = parseInt(d.substring(s2 + 1));
	day = parseInt(d.substring(s + 1, s2));
	month = monthsToInt[d.substring(0, s)];
	return ((isNaN(year) || isNaN(month) || isNaN(day)) ? -2147483648 : ((year * 10000) + (month * 100) + day));
} : function (d) {
	if (!d)
		return -2147483648;
	var s, s2, year, month, day;
	if ((s = d.indexOf(">")) > 0)
		d = d.substring(s + 1, d.lastIndexOf("<"));
	s = d.indexOf("/");
	s2 = d.lastIndexOf("/");
	if (s <= 0 || s2 <= s)
		return -2147483648;
	year = parseInt(d.substring(s2 + 1));
	month = monthsToInt[d.substring(s + 1, s2)];
	day = parseInt(d.substring(0, s));
	return ((isNaN(year) || isNaN(month) || isNaN(day)) ? -2147483648 : ((year * 10000) + (month * 100) + day));
});

$.fn.dataTable.ext.type.order["customdateint-pre"] = (window.currentLanguageId === 1 ? function (d) {
	if (!d)
		return -2147483648;
	var s, s2, year, month, day;
	if ((s = d.indexOf(">")) > 0)
		d = d.substring(s + 1, d.lastIndexOf("<"));
	s = d.indexOf("/");
	s2 = d.lastIndexOf("/");
	if (s <= 0 || s2 <= s)
		return -2147483648;
	year = parseInt(d.substring(s2 + 1));
	day = parseInt(d.substring(s + 1, s2));
	month = parseInt(d.substring(0, s));
	return ((isNaN(year) || isNaN(month) || isNaN(day)) ? -2147483648 : ((year * 10000) + (month * 100) + day));
} : function (d) {
	if (!d)
		return -2147483648;
	var s, s2, year, month, day;
	if ((s = d.indexOf(">")) > 0)
		d = d.substring(s + 1, d.lastIndexOf("<"));
	s = d.indexOf("/");
	s2 = d.lastIndexOf("/");
	if (s <= 0 || s2 <= s)
		return -2147483648;
	year = parseInt(d.substring(s2 + 1));
	month = parseInt(d.substring(s + 1, s2));
	day = parseInt(d.substring(0, s));
	return ((isNaN(year) || isNaN(month) || isNaN(day)) ? -2147483648 : ((year * 10000) + (month * 100) + day));
});

$.fn.dataTable.ext.type.order["customdatetime-pre"] = (window.currentLanguageId === 1 ? function (d) {
	if (!d)
		return -2147483648;
	var s, s2, s3, year, month, day, hour = 0, minute = 0, second = 0;
	if ((s = d.indexOf(">")) > 0)
		d = d.substring(s + 1, d.lastIndexOf("<"));
	s = d.indexOf("/");
	s2 = d.lastIndexOf("/");
	if (s <= 0 || s2 <= s)
		return -2147483648;
	year = parseInt(d.substring(s2 + 1));
	day = parseInt(d.substring(s + 1, s2));
	month = monthsToInt[d.substring(0, s)];
	if (isNaN(year) || isNaN(month) || isNaN(day))
		return -2147483648;
	s = d.lastIndexOf(" ");
	if (s >= s2) {
		s++;
		s2 = d.indexOf(":", s);
		if (s2 > s) {
			hour = parseInt(d.substring(s));
			minute = parseInt(d.substring(s2 + 1));
			if (isNaN(hour) || isNaN(minute)) {
				hour = 0;
				minute = 0;
			} else {
				s3 = d.indexOf(":", s2 + 1);
				if (s3 > s2)
					second = parseInt(d.substring(s3 + 1)) || 0;
			}
		}
	}
	return (year * 10000000000) + (month * 100000000) + (day * 1000000) + (hour * 10000) + (minute * 100) + second;
} : function (d) {
	if (!d)
		return -2147483648;
	var s, s2, s3, year, month, day, hour = 0, minute = 0, second = 0;
	if ((s = d.indexOf(">")) > 0)
		d = d.substring(s + 1, d.lastIndexOf("<"));
	s = d.indexOf("/");
	s2 = d.lastIndexOf("/");
	if (s <= 0 || s2 <= s)
		return -2147483648;
	year = parseInt(d.substring(s2 + 1));
	month = monthsToInt[d.substring(s + 1, s2)];
	day = parseInt(d.substring(0, s));
	if (isNaN(year) || isNaN(month) || isNaN(day))
		return -2147483648;
	s = d.lastIndexOf(" ");
	if (s >= s2) {
		s++;
		s2 = d.indexOf(":", s);
		if (s2 > s) {
			hour = parseInt(d.substring(s));
			minute = parseInt(d.substring(s2 + 1));
			if (isNaN(hour) || isNaN(minute)) {
				hour = 0;
				minute = 0;
			} else {
				s3 = d.indexOf(":", s2 + 1);
				if (s3 > s2)
					second = parseInt(d.substring(s3 + 1)) || 0;
			}
		}
	}
	return (year * 10000000000) + (month * 100000000) + (day * 1000000) + (hour * 10000) + (minute * 100) + second;
});

$.fn.dataTable.ext.type.order["customdatetimeint-pre"] = (window.currentLanguageId === 1 ? function (d) {
	if (!d)
		return -2147483648;
	var s, s2, s3, year, month, day, hour = 0, minute = 0, second = 0;
	if ((s = d.indexOf(">")) > 0)
		d = d.substring(s + 1, d.lastIndexOf("<"));
	s = d.indexOf("/");
	s2 = d.lastIndexOf("/");
	if (s <= 0 || s2 <= s)
		return -2147483648;
	year = parseInt(d.substring(s2 + 1));
	day = parseInt(d.substring(s + 1, s2));
	month = parseInt(d.substring(0, s));
	if (isNaN(year) || isNaN(month) || isNaN(day))
		return -2147483648;
	s = d.lastIndexOf(" ");
	if (s >= s2) {
		s++;
		s2 = d.indexOf(":", s);
		if (s2 > s) {
			hour = parseInt(d.substring(s));
			minute = parseInt(d.substring(s2 + 1));
			if (isNaN(hour) || isNaN(minute)) {
				hour = 0;
				minute = 0;
			} else {
				s3 = d.indexOf(":", s2 + 1);
				if (s3 > s2)
					second = parseInt(d.substring(s3 + 1)) || 0;
			}
		}
	}
	return (year * 10000000000) + (month * 100000000) + (day * 1000000) + (hour * 10000) + (minute * 100) + second;
} : function (d) {
	if (!d)
		return -2147483648;
	var s, s2, s3, year, month, day, hour = 0, minute = 0, second = 0;
	if ((s = d.indexOf(">")) > 0)
		d = d.substring(s + 1, d.lastIndexOf("<"));
	s = d.indexOf("/");
	s2 = d.lastIndexOf("/");
	if (s <= 0 || s2 <= s)
		return -2147483648;
	year = parseInt(d.substring(s2 + 1));
	month = parseInt(d.substring(s + 1, s2));
	day = parseInt(d.substring(0, s));
	if (isNaN(year) || isNaN(month) || isNaN(day))
		return -2147483648;
	s = d.lastIndexOf(" ");
	if (s >= s2) {
		s++;
		s2 = d.indexOf(":", s);
		if (s2 > s) {
			hour = parseInt(d.substring(s));
			minute = parseInt(d.substring(s2 + 1));
			if (isNaN(hour) || isNaN(minute)) {
				hour = 0;
				minute = 0;
			} else {
				s3 = d.indexOf(":", s2 + 1);
				if (s3 > s2)
					second = parseInt(d.substring(s3 + 1)) || 0;
			}
		}
	}
	return (year * 10000000000) + (month * 100000000) + (day * 1000000) + (hour * 10000) + (minute * 100) + second;
});

$.fn.prepareFilters = function (obj) {
	if (this.length !== 1) {
		if (this.length)
			alert("Você não pode utilizar a função prepareFilters() com uma query que retorna mais de um elemento por vez.");
		return [];
	}

	var i, j, label, input, multiple, filters = [], div, divs = $("div.form-group", this);

	for (i = 0; i < divs.length; i++) {
		div = divs[i];

		label = div.getElementsByTagName("LABEL")[0];
		if (!label)
			continue;
		label = trim(label.textContent);
		if (!label)
			continue;
		if (label.charAt(label.length - 1) == ":")
			label = trim(label.substr(0, label.length - 1));
		if (!label)
			continue;

		input = div.getElementsByTagName("INPUT")[0];
		if (input && input.getAttribute("type") != "hidden") {
			switch (input.getAttribute("type")) {
				case "checkbox":
				case "radio":
					input = (window.currentLanguageId === 1 ? (input.checked ? "Yes" : "No") : (input.checked ? "Sim" : "Não"));
					break;
				default:
					input = trim(input.value.toString());
					break;
			}
		} else {
			input = div.getElementsByTagName("SELECT")[0];
			if (!input)
				continue;

			// Try to fetch the value from a select (whether it is multiple or not)
			if (input.getAttribute("multiple")) {
				multiple = "";

				for (j = 0; j < input.options.length; j++) {
					if (!input.options[j].selected)
						continue;

					if (multiple)
						multiple += "; ";

					multiple += trim(input.options[j].text);
				}

				input = multiple;
			} else {
				if (input.selectedIndex < 0 || !input.value)
					continue;

				input = trim(input.options[input.selectedIndex].text);
			}
		}

		if (!input)
			continue;

		filters.push({ name: label, value: (input || "").toUpperCase() });
	}

	if (obj && obj.length) {
		// Add any custom filters
		for (i = 0; i < obj.length; i++)
			filters.push(obj[i]);
	}

	return filters;
};

window.prepareColumnPicker = function (dt, parentId, columnPicker) {
	let ok = false, button = null;

	addFilterButton(parentId, "fa-nomargin fa-columns", null, function () {
		if (!ok) {
			const selectId = parentId + "_columnPicker",
				selectParent = document.createElement("div"),
				select = document.createElement("select"),
				colcount = dt.columns().indexes().length,
				colsettings = dt.settings()[0].aoColumns,
				options = (typeof columnPicker !== "object") ? {} : columnPicker,
				validColumns = [],
				validTitles = [];

			select.setAttribute("id", selectId);
			selectParent.style.display = "none";
			selectParent.appendChild(select);
			_(parentId).appendChild(selectParent);

			let initialSelection = [];

			const regex1 = /<[^>]*>/g;
			const regex3 = /^\s+|\s+$/g;
			const tmpDiv = document.createElement("div");

			for (let i = 0; i < colcount; i++) {
				let th;
				tmpDiv.innerHTML = (((th = colsettings[i].nTh) && th.getAttribute("title")) || colsettings[i].sTitle).toString();
				const title = tmpDiv.textContent.replace(regex1, "").replace(regex3, "");
				if (!title || colsettings[i].hideable === false || colsettings[i].hidable === false)
					continue;

				const option = document.createElement("option");
				option.setAttribute("value", validColumns.length);
				option.textContent = title;
				select.appendChild(option);
				if (colsettings[i].bVisible)
					initialSelection.push(validColumns.length);
				validColumns.push(i);
				validTitles.push(title);
			}

			prepareMultiselect(select, {
				title: (window.currentLanguageId === 1 ? "Select Columns" : "Escolher Colunas"),
				callback: function (multiselect) {
					const selection = getMultiselectSelection(multiselect),
						selectionObj = new Set(),
						persist = (options.persistId ? {} : null);
					let empty = true;

					for (let i = selection.length - 1; i >= 0; i--)
						selectionObj.add(parseInt(selection[i]));

					for (let i = validColumns.length - 1; i >= 0; i--) {
						const newVisible = selectionObj.has(i),
							column = dt.column(validColumns[i]);

						if (column.visible() !== newVisible)
							column.visible(newVisible);

						if (persist && !newVisible) {
							persist[validColumns[i] + "/" + validTitles[i]] = 1;
							empty = false;
						}
					}

					if (persist) {
						if (empty)
							localStorage.removeItem(options.persistId);
						else
							localStorage.setItem(options.persistId, JSON.stringify(persist));
					}
				}
			});

			button = document.getElementById(selectId);

			setMultiselectSelection(button, initialSelection);
			initialSelection = null;

			ok = true;
		}

		button.click();
	}).setAttribute("title", (window.currentLanguageId === 1 ? "Select Columns" : "Escolher Colunas"));
};

window.prepareDataTable = function (id, opt) {
	var el = _(id), dt, div, o = (opt || {}), f, fullName = "dataTable_PageLength_", removeDom = o.customRemoveDom;

	if (id === "dataTableMain") {
		f = window.location.href;
		if (!f || (dt = f.lastIndexOf('/')) <= 0) {
			fullName += id;
		} else {
			f = f.substr(dt + 1);
			if ((dt = f.indexOf('.')) > 0)
				f = f.substring(0, dt);
			fullName += f;
		}
	} else {
		fullName += id;
	}

	if (removeDom === "f") {
		//https://datatables.net/reference/option/dom
		// Does not look good at all!!!
		//if (!("dom" in o))
		//	o.dom = "lrtip";
		o.searchable = false;
	}
	if (!("autoWidth" in o))
		o.autoWidth = false;
	if (!("paging" in o))
		o.paging = true;
	if (!("ordering" in o))
		o.ordering = true;
	if (o.ordering && !("order" in o))
		o.order = [[0, "desc"]];
	if (!("info" in o))
		o.info = true;
	if (!("responsive" in o))
		o.responsive = false;
	if (!("columns" in o) && window.tableColumns)
		o.columns = window.tableColumns;
	if (!("language" in o))
		o.language = window.tableLanguage;
	if (!("pageLength" in o) && window.localStorage) {
		f = parseInt(localStorage[fullName]);
		if (isNaN(f) || f < -1 || f > 200) {
			f = parseInt(o.customDefaultPageLength);
			if (isNaN(f) || f < -1 || f > 200)
				f = 10;
			localStorage[fullName] = f;
		}
		o.pageLength = f;
	}

	if (o.headerTooltips) {
		o.initComplete = function (settings, json) {
			var i, cols, len, c, t, th;
			if (settings && (cols = settings.aoColumns) && (len = cols.length)) {
				for (i = len - 1; i >= 0; i--) {
					if (!(c = cols[i]) || !(t = c.tooltip) || !(th = c.nTh))
						continue;
					th.setAttribute("title", t);
				}
			}
		};
	}

	if (removeDom !== "l")
		o.lengthMenu = (o.removeAll ?
			[[4, 10, 25, 50, 100, 200], [4, 10, 25, 50, 100, 200]] :
			[[4, 10, 25, 50, 100, 200, -1], [4, 10, 25, 50, 100, 200, (window.currentLanguageId === 1 ? "All" : "Todos")]]
		);

	if (typeof o.columnPicker === "object" && o.columnPicker.persist) {
		const persistId = (("localStorage" in window) ? (location.host + location.pathname + "#" + id) : null);
		if (persistId) {
			try {
				o.columnPicker.persistId = persistId;
				const json = localStorage.getItem(persistId),
					hiddenColumns = (json ? JSON.parse(json) : null);
				if (hiddenColumns && typeof hiddenColumns === "object") {
					for (let i = 0; i < o.columns.length; i++) {
						if (!o.columns[i].title || o.columns[i].hideable === false || o.columns[i].hidable === false)
							continue;

						if (hiddenColumns[i + "/" + o.columns[i].title])
							o.columns[i].visible = false;
					}
				}
			} catch (ex) {
				// Invalid JSON in localStorage
			}
		}
	}

	dt = $(el).DataTable(o);

	if (removeDom === "f") {
		f = _(id + "_filter");
		if (f)
			f.parentNode.removeChild(f);
	} else {
		prepareCustomFilter(dt, id, "", (window.currentLanguageId === 1 ? "Filter" : "Filtro"));
		if (removeDom === "l") {
			f = _(id + "_length");
			if (f) {
				f.parentNode.parentNode.removeChild(f.parentNode);
				f = _(id + "_filter");
				if (f)
					f.parentNode.className = "col-lg-12";
			}
		} else if (o.customPageLengthColumnSize) {
			f = _(id + "_length");
			if (f) {
				f.parentNode.className = "col-sm-" + o.customPageLengthColumnSize;
				f = _(id + "_filter");
				if (f)
					f.parentNode.className = "col-sm-" + (12 - o.customPageLengthColumnSize);
			}
		}
		if (o.export) {
			addFilterButton(id + "_filter", "fa-nomargin fa-download", null, function () {
				DataTableExporter.exportCSV(dt, {
					title: o.export.title,
					includeNonSortableColumns: !!o.export.includeNonSortableColumns,
					filterTitle: o.export.filterTitle,
					filters: o.export.filters //[{name:"", value:""},...]
				});
			}).setAttribute("title", (window.currentLanguageId === 1 ? "Export CSV" : "Exportar CSV"));

			if (o.export.xlsx) {
				addFilterButton(id + "_filter", "fa-nomargin fa-file-excel-o fa-file-excel", null, function () {
					DataTableExporter.exportCSV(dt, {
						xlsx: o.export.xlsx,
						xlsxPreHeader: o.export.xlsxPreHeader,
						title: o.export.title,
						includeNonSortableColumns: !!o.export.includeNonSortableColumns,
						filterTitle: o.export.filterTitle,
						filters: o.export.filters //[{name:"", value:""},...]
					});
				}).setAttribute("title", (window.currentLanguageId === 1 ? "Export XLSX" : "Exportar XLSX"));
			}
		}
		if (o.columnPicker)
			prepareColumnPicker(dt, id + "_filter", o.columnPicker);
	}
	if (removeDom !== "l" && window.localStorage) {
		f = _(id + "_length");
		if (f && (f = f.getElementsByTagName("SELECT")) && (f = f[0])) {
			f.addEventListener("change", function () {
				localStorage[fullName] = this.value;
			});
			$(f).removeClass("custom-select custom-select-sm");
		}
	}

	div = document.createElement("div");
	div.className = "table-responsive";
	div.style.marginBottom = "15px";
	//div.style.border = "0";

	el.parentNode.insertBefore(div, el);
	el.parentNode.removeChild(el);
	div.appendChild(el);

	$(el).removeClass("hidden");

	return dt;
}

window.DataTableExporter = {
	alertNothingToExport: function () {
		var msg = ((window.currentLanguageId === 1) ? "There is no data available to export \uD83D\uDE22" : "Não há dados disponíveis para exportação \uD83D\uDE22");
		if (window.Swal)
			Swal.error(msg);
		else
			Notification.error(msg, true);
		return false;
	},

	normalizeConfig: function (config, extension) {
		if (!config)
			config = {};

		config.regex1 = /<[^>]*>/g;
		config.regex2 = /\r\n|\r|\n/g;
		config.regex3 = /^\s+|\s+$/g;

		config.title = (config.title || (window.currentLanguageId === 1 ? "Data" : "Dados")).toString().replace(config.regex1, "").replace(config.regex3, "");

		if (!config.filename)
			config.filename = config.title.replace(config.regex2, " ");

		config.filename = config.filename.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, "");

		if (extension) {
			if (config.filename.toLowerCase().indexOf(extension) < 0)
				config.filename += extension;
		}

		config.cleanup = function (x) {
			return x.replace(config.regex1, "").replace(config.regex2, " ").replace(config.regex3, "");
		};

		return config;
	},

	exportCSV: function (dt, config) {
		if (!BlobDownloader.supported)
			return BlobDownloader.alertNotSupported();

		DataTableExporter.normalizeConfig(config, ".csv");

		config.regexQuote = /\"/g;

		var i, c, v, blobdata, b = 0, colhdr = [], colidx = [], colDataSrc, colDataIdx = [], colDataIsFunction = [], colDataMustUseEval = [], th, colcount = dt.columns().indexes().length, rownodes, rowcount = dt.rows().count(), rowarray, filterCount = (!config.filters ? 0 : config.filters.length), colsettings = dt.settings()[0].aoColumns, tmpDiv = document.createElement("div"),
			xlsx = !!config.xlsx, rowdata,	
			today = new Date(), fmt2 = function (x) {
				return (x < 10 ? ("0" + x) : x);
			};

		for (i = 0; i < colcount; i++) {
			// We must ignore invisible columns
			if (!dt.column(i).visible())
				continue;

			// Since the column is visible, its index should be accounted for, but if the column is not
			// sortable, we must not take its index into account when generating the output
			if (!config.includeNonSortableColumns && !colsettings[i].bSortable)
				continue;

			tmpDiv.innerHTML = (((th = colsettings[i].nTh) && th.getAttribute("title")) || colsettings[i].sTitle).toString();
			colhdr.push(tmpDiv.textContent.replace(config.regex1, "").replace(config.regex3, ""));
			colidx.push(i);
			colDataSrc = colsettings[i].mData;
			if (colDataSrc._) colDataSrc = colDataSrc._;
			colDataIdx.push(colDataSrc);
			colDataIsFunction.push((typeof colDataSrc === "function"));
			colDataMustUseEval.push((typeof colDataSrc === "string") && colDataSrc.indexOf(".") > 0);
		}

		colcount = colhdr.length;

		if (!colcount || !rowcount)
			return DataTableExporter.alertNothingToExport();

		// Let's count how many elements the final array will have, therefore, creating the entire array at once
		blobdata = xlsx ? [] : new Array(
			1 + // UTF-8 BOM
			5 + // " + Title + ";" + Date + "\n
			1 + // \n
			(filterCount ?
				4 + (filterCount * 5) + 1 : // " + Filtros + "\n + \n + (" + Filtro + ";" + Valor + "\n) para cada filtro + \n
				0
			) +
			(colcount * 2) + 1 + // (" + Title or ";" + Title) + "\n (for each cell in the header)
			(rowcount * ((colcount * 2) + 1)) // (" + Value or ";" + Value) (for each cell in the table) + "\n (for each row)
		);

		if (!xlsx) {
			blobdata[b++] = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM

			blobdata[b++] = "\"";
			blobdata[b++] = config.title.replace(config.regexQuote, "\"\"");
			blobdata[b++] = "\";\"";
			blobdata[b++] = fmt2(today.getDate()) + "/" + fmt2(today.getMonth() + 1) + "/" + today.getFullYear() + " " + fmt2(today.getHours()) + ":" + fmt2(today.getMinutes());
			blobdata[b++] = "\"\n";

			blobdata[b++] = "\n";

			if (filterCount) {
				blobdata[b++] = "\"";
				blobdata[b++] = (config.filterTitle || (window.currentLanguageId === 1 ? "Filters" : "Filtros")).toString().replace(config.regex1, "").replace(config.regex3, "").replace(config.regexQuote, "\"\"");
				blobdata[b++] = "\"\n";
				blobdata[b++] = "\n";

				for (i = 0; i < filterCount; i++) {
					blobdata[b++] = "\"";
					blobdata[b++] = (config.filters[i].name || "").toString().replace(config.regex1, "").replace(config.regex3, "").replace(config.regexQuote, "\"\"");
					blobdata[b++] = "\";\"";
					blobdata[b++] = (config.filters[i].value || "").toString().replace(config.regex1, "").replace(config.regex3, "").replace(config.regexQuote, "\"\"");
					blobdata[b++] = "\"\n";
				}

				blobdata[b++] = "\n";
			}

			for (i = 0; i < colcount; i++) {
				blobdata[b++] = (i ? "\";\"" : "\"");
				blobdata[b++] = colhdr[i].replace(config.regexQuote, "\"\"");
			}
			blobdata[b++] = "\"\n";

			rownodes = dt.rows({ order: "current" }).data();

			for (i = 0; i < rowcount; i++) {
				rowarray = rownodes[i];
				for (c = 0; c < colcount; c++) {
					blobdata[b++] = (c ? "\";\"" : "\"");
					if (colsettings[colidx[c]].mRender) {
						// If we are rendering using encode, ignore regex1
						v = (colDataIsFunction[c] ? colDataIdx[c](rowarray) : (colDataMustUseEval[c] ? eval("rowarray." + colDataIdx[c]) : rowarray[colDataIdx[c]]));
						blobdata[b++] = (v === null ? "" : v).toString().replace(config.regex3, "").replace(config.regexQuote, "\"\"");
					} else {
						// Otherwise, remove the tags and replace the rest
						v = (colDataIsFunction[c] ? colDataIdx[c](rowarray) : (colDataMustUseEval[c] ? eval("rowarray." + colDataIdx[c]) : rowarray[colDataIdx[c]]));
						tmpDiv.innerHTML = (v === null ? "" : v).toString().replace(config.regex1, "").replace(config.regex3, "");
						blobdata[b++] = tmpDiv.textContent.replace(config.regexQuote, "\"\"");
					}
				}
				blobdata[b++] = "\"\n";
			}

			BlobDownloader.download(config.filename, new Blob(blobdata, { type: "text/csv;charset=utf-8" }));
		} else {
			if (config.xlsxPreHeader) {
				rowdata = [
					config.title,
					fmt2(today.getDate()) + "/" + fmt2(today.getMonth() + 1) + "/" + today.getFullYear() + " " + fmt2(today.getHours()) + ":" + fmt2(today.getMinutes())
				];
				blobdata.push(rowdata);

				blobdata.push([]);

				if (filterCount) {
					rowdata = [
						config.filterTitle || (window.currentLanguageId === 1 ? "Filters" : "Filtros")
					];
					blobdata.push(rowdata);

					blobdata.push([]);

					for (i = 0; i < filterCount; i++) {
						rowdata = [
							config.filters[i].name,
							config.filters[i].value
						];
						blobdata.push(rowdata);
					}

					blobdata.push([]);
				}
			}

			rowdata = [];
			for (i = 0; i < colcount; i++)
				rowdata.push(colhdr[i]);
			blobdata.push(rowdata);

			rownodes = dt.rows({ order: "current" }).data();

			for (i = 0; i < rowcount; i++) {
				rowdata = [];
				rowarray = rownodes[i];
				for (c = 0; c < colcount; c++) {
					if (colsettings[colidx[c]].mRender) {
						// If we are rendering using encode, ignore regex1
						v = (colDataIsFunction[c] ? colDataIdx[c](rowarray) : (colDataMustUseEval[c] ? eval("rowarray." + colDataIdx[c]) : rowarray[colDataIdx[c]]));
						rowdata.push((v === null ? "" : v).toString());
					} else {
						// Otherwise, remove the tags and replace the rest
						v = (colDataIsFunction[c] ? colDataIdx[c](rowarray) : (colDataMustUseEval[c] ? eval("rowarray." + colDataIdx[c]) : rowarray[colDataIdx[c]]));
						tmpDiv.innerHTML = (v === null ? "" : v).toString();
						rowdata.push(tmpDiv.textContent);
					}
				}
				blobdata.push(rowdata);
			}

			const filename = config.filename.replace(".csv", "");
			const worksheet = XLSX.utils.aoa_to_sheet(blobdata);
			const workbook = XLSX.utils.book_new();
			// Sheet names cannot contain more than 31 chars!
			XLSX.utils.book_append_sheet(workbook, worksheet, window.currentLanguageId === 1 ? "Data" : "Dados");
			XLSX.writeFile(workbook, filename + ".xlsx", { compression: false });
		}
	}
};
