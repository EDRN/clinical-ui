collections = [];
collection_disc = {};
collection_labels = [];
collection_dataset_count = [];
var collection_protocolid_map = {};
function get_acronym(str){
	var matches = str.match(/\b(\w)/g);
	return matches.join('');
}
function init_labcas_sunburst_distribution(div_field, collections, collection_dataset_count, collection_labels, xlabel, ylabel){
	
	var data = [{
	  colorscale: 'Blackbody',
	  x: collections,
	  y: collection_dataset_count,
	  marker: {color:  ['rgb(165,0,38)','rgb(69,117,180)', 'rgb(116,173,209)','rgb(253,174,97)','rgb(254,224,144)','rgb(244,109,67)','rgb(224,243,248)','rgb(171,217,233)','rgb(215,48,39)','rgb(49,54,149)']},
	  mode: "markers",
	  text: collection_labels,
	  type: 'bar',
	  colorscale: 'Jet'
	}];

	var layout = {
	  yaxis: {title: ylabel},
	  xaxis: {title: xlabel, showline: true, tickangle: 30},
	  mode: 'text',
	  margin: {t: 0, b: 110},
	  height: 230,
	  showlegend: false
	};


	Plotly.newPlot(div_field, data, layout,{displayModeBar: false, responsize: true});
}



function init_labcas_data_distribution(div, second_graph_organ, ftype){ //acronym, name, count, date
	var data = [{
	  values: second_graph_organ[1],
	  text: second_graph_organ[0],
	 textposition: 'inside',
	  type: 'pie'
	}];

	var layout = {
	  margin: {t: 0, b: 0},
	  height: 200,
	  showlegend: false
	};
	myplot = Plotly.newPlot(div, data, layout,{displayModeBar: false, responsize: true});
	document.getElementById(div).on('plotly_click', function(data){
		var pts = '';
		    for(var i=0; i < data.points.length; i++){
			pts = 'label(country) = '+ data.points[0].text + '\nvalue(%) = ' + data.points[0].value;
			label = data.points[0].text;
			field_search = "&fq=("+encodeURI(escapeRegExp(ftype)).replace(/:/g,'%3A')+":"+encodeURI(escapeRegExp(String(label)))+")";
			reset_search_filters();
			localStorage.setItem(div, field_search);
			filter_list = [];
			filter_list.push(String(label));
			localStorage.setItem(div+"_val",filter_list);
			localStorage.setItem("search_filter", "on");
			localStorage.setItem('search','');
			window.location.replace("/clinical-ui/s/index.html");
		    }
	});
}

function init_labcas_data_boxplot(div, second_graph,xlabel, ylabel){
	
	
	var data = [{
	  colorscale: 'Blackbody',
	  x: second_graph[0],
	  y: second_graph[1],
	  marker: {color:  ['rgb(165,0,38)','rgb(69,117,180)', 'rgb(116,173,209)','rgb(253,174,97)','rgb(254,224,144)','rgb(244,109,67)','rgb(224,243,248)','rgb(171,217,233)','rgb(215,48,39)','rgb(49,54,149)']},
	  //marker: {color: data.color, size: data.size},
	  mode: "markers",
	  //text: second_graph[0],
	  type: 'bar',
	  colorscale: 'Jet'
	}];

	var layout = {
	  yaxis: {title: ylabel},
	  xaxis: {title: xlabel, showline: true, tickangle: 20},
	  margin: {t: 0, b: 110},
	  height: 200,
	  showlegend: false
	};


	Plotly.newPlot(div, data, layout,{displayModeBar: false, responsize: true});
	
}

function convert_dict_to_list(dict){
    var lists = [[],[]];
    $.each(dict, function(key, obj) {
        lists[0].push(key);
        lists[1].push(obj);
    });
    return lists;
}

function fill_participant_analytics(data){
	var size = data.length;
	$("#participant_len").html(size);

    site_freq = {};
    org_freq = {};
    race_freq = {};

    
	$.each(data, function(key, obj) {
        var site = obj.siteID? obj.siteID: "None";

        if (localStorage.getItem("site"+site)){
            site = localStorage.getItem("site"+site);
        }
        var race = obj.race? obj.race: "None";

        if(!site_freq[site]){
            site_freq[site] = 0;
        }
        site_freq[site] += 1;


        if(!race_freq[race]){
            race_freq[race] = 0;
        }
        race_freq[race] += 1;

        $.each(obj.organs, function(index_org, obj_org) {
            if (obj_org.organType.includes("Organs")){
               obj_org.organType = obj_org.organType.replace("Organs","");
            }
            if (!org_freq[obj_org.organType]){
                org_freq[obj_org.organType] = 0;
            }
            org_freq[obj_org.organType] += 1;
            return;
        });

    });
    
	//init_labcas_data_boxplot("site_filters",convert_dict_to_list(site_freq), "Site", "Participant Count");
	init_labcas_data_distribution("org_filters", convert_dict_to_list(org_freq), "Organ");
	init_labcas_data_distribution("race_filters", convert_dict_to_list(race_freq), "Race");
	
}
function fill_organ_analytics(data){
	var size = data.length;
	$("#organ_len").html(size);
	
	//init_labcas_sunburst_distribution("labcas_sunburst_distribution", collections, collection_dataset_count, collection_labels, 'Protocol ID', 'Dataset Count');
}
function fill_specimen_analytics(data){
	var size = data.length;
    $('#specimen_len').html(size);

    pre_freq = {};
	$.each(data, function(key, obj) {
        var pre = obj.precancer_type? obj.precancer_type: "None";

        if(!pre_freq[pre]){
            pre_freq[pre] = 0;
        }
        pre_freq[pre] += 1;
    });

	init_labcas_data_distribution("pre_filters", convert_dict_to_list(pre_freq), "Precancer Type");
    //init_labcas_sunburst_distribution("labcas_filetype_distribution",filetypes, filetypecounts, filetypes, 'File Type', "File Count");
	//init_labcas_data_boxplot("labcas_boxplot_distribution",second_graph_leadpi, "Lead PI", "File Count");
	
}
function fill_genomics_analytics(data){
	$("#genomic_len").html(data.length);

    lib_freq = {};
    $.each(data, function(key, obj) {
        var lib = obj.library_strategy? obj.library_strategy: "None";

        if(!lib_freq[lib]){
            lib_freq[lib] = 0;
        }
        lib_freq[lib] += 1;
    });

    //init_labcas_data_distribution("lib_filters", convert_dict_to_list(lib_freq), "Library Type");

}
function setup_labcas_analytics(){
        console.log("Analyzing...");
        //collection data
    query_labcas_api(localStorage.getItem('environment')+"/clinicalCores", fill_participant_analytics);
    query_labcas_api(localStorage.getItem('environment')+"/organs", fill_organ_analytics);
    query_labcas_api(localStorage.getItem('environment')+"/specimens", fill_specimen_analytics);
    query_labcas_api(localStorage.getItem('environment')+"/genomics", fill_genomics_analytics);
	/*var collection_url = localStorage.getItem('environment')+"/clinicalCores";
	console.log(collection_url);
	$.ajax({
		url: collection_url,	
		beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", Cookies.get('Authorization'));
		},
		type: 'GET',
		dataType: 'json',
		success: function (data) {
			fill_participant_analytics(data); 
		},
		error: function(){
			 alert("Login expired, please login...");
			 window.location.replace("/clinical-ui/index.html");
		 }
	});*/

}
