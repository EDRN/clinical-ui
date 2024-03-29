var page_files = {};
var test_var;
Array.prototype.contains = function(v) {
      for (var i = 0; i < this.length; i++) {
              if (this[i] === v) return true;
                }
        return false;
};

Array.prototype.unique = function() {
      var arr = [];
        for (var i = 0; i < this.length; i++) {
                if (!arr.contains(this[i])) {
                          arr.push(this[i]);
                              }
                  }
          return arr;
}
function initiate_search(){
      var get_var = get_url_vars();
        if(localStorage.getItem("search")){
            localStorage.setItem("search", get_var["search"]);
        }else{
            localStorage.setItem("search", "*");
        }
        $.each(localStorage.getItem("filters").split(","), function(ind, head) {
                var divs = localStorage.getItem(head+"_filters_div").split(",");
                $.each(divs, function(i, divhead) {
			if (!localStorage.getItem($.trim(divhead))){
				localStorage.setItem($.trim(divhead), "");
			}
                        if(divhead.includes("_num_")){
                                if (!localStorage.getItem($.trim(divhead)+"_0")){
                                        localStorage.setItem($.trim(divhead)+"_0","");
                                        localStorage.setItem($.trim(divhead)+"_1","");
                                        localStorage.setItem($.trim(divhead)+"_max_0","");
                                        localStorage.setItem($.trim(divhead)+"_max_1","");
                                }
                        }else{
                                if (!localStorage.getItem($.trim(divhead)+"_val")){
                                        localStorage.setItem($.trim(divhead)+"_val", "");
                                }
                        }
                });
        });

        setup_labcas_search(localStorage.getItem("search"), "all", 0);
}

function fill_collections_public_data(data){
	//data.response.docs.sort(dataset_compare_sort);
	$.each(data.response.docs, function(index, obj) {
		if ((!obj.QAState) || (obj.QAState && !obj.QAState.includes("Private"))){
			var color = "btn-info";
			if(user_data["FavoriteCollections"].includes(obj.id)){
				color = "btn-success";
			}
		
		
			var institutions = obj.Institution? obj.Institution.join(",") : "";
			var pis = obj.LeadPI? obj.LeadPI.join(",") : "";
			var orgs = obj.Organ? obj.Organ.join(",") : "";
		
			if (localStorage.getItem('environment').includes("edrn-labcas")){
				var obj_arr = generate_edrn_links(obj);
				protocols = obj_arr[3].join(",");
				orgs = obj_arr[2].join(",");
			}else if(localStorage.getItem('environment').includes("mcl-labcas") || localStorage.getItem('environment').includes("labcas-dev")){
				var obj_arr = generate_mcl_links(obj);
				protocols = obj_arr[3].join(",");
				orgs = obj_arr[2].join(",");
			}
			  $("#collection-table tbody").append(
				"<tr>"+
					"<td></td><td>"+
					"<a href=\"/clinical-ui/c/index.html?collection_id="+
						obj.id+"\">"+
					obj.CollectionName+"</a></td>"+
					"<td>"+orgs+"</td>"+
					"<td>"+obj.Discipline+"</td>"+
					"<td>"+institutions+"</td>"+
					"<td>"+pis+"</td>"+
					"<td class=\"td-actions\">"+
							"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteCollections')\" class=\"btn "+color+" btn-simple btn-link\">"+
								"<i class=\"fa fa-star\"></i>"+
							"</button>"+
						"</td>"+
				"</tr>");
		}
    });
    $('#loading').hide(500);
    $table.bootstrapTable({
            toolbar: ".toolbar",
            clickToSelect: true,
            showRefresh: true,
            search: true,
            showToggle: true,
            showColumns: true,
            pagination: true,
            searchAlign: 'left',
            pageSize: 50,
            clickToSelect: false,
            pageList: [8, 10, 25, 50, 100],

            formatShowingRows: function(pageFrom, pageTo, totalRows) {
                //do nothing here, we don't want to show the text "showing x of y from..."
            },
            formatRecordsPerPage: function(pageNumber) {
              return pageNumber + " rows visible";
            },
            icons: {
               refresh: 'fa fa-refresh',
               toggle: 'fa fa-th-list',
               columns: 'fa fa-columns',
               detailOpen: 'fa fa-plus-circle',
               detailClose: 'fa fa-minus-circle'
           }
    });

    //activate the tooltips after the data table is initialized
    $('[rel="tooltip"]').tooltip();

    $(window).resize(function() {
        $table.bootstrapTable('resetView');
    });
}
function fill_clinicalcore_participant(data, query_site, query_organ){
	//data.response.docs.sort(dataset_compare_sort);
    clinicalcore_dict = {};
    console.log(data);
    var organ_list  = {};
    var clinicalcore_count = 0;
    $.each(data, function(index, obj) {
        console.log(obj);
    	var color = "btn-info";
		if(user_data["FavoriteCollections"].includes(obj.id)){
			color = "btn-success";
    	}

        var organ = "None";
        $.each(obj.organs, function(index_org, obj_org) {
            if (obj_org.organType.includes("Organs")){
               obj_org.organType = obj_org.organType.replace("Organs","");
            }
            organ = obj_org.organType;
            return;
        });
        var site = obj.siteID? obj.siteID: "None";
        if (!query_site || (site == query_site && organ == query_organ)){
          if (localStorage.getItem("search_flag") != "true" || JSON.stringify(obj).includes(localStorage.getItem("search"))){
          clinicalcore_count += 1;
          organ_list[organ] = 1;
          $("#participant-table tbody").append(
            "<tr>"+
                "<td></td><td>"+
                "<a href=\"/clinical-ui/c/index.html?participant_id="+
                    obj.participant_ID+"&site_id="+query_site+"&organ_id="+query_organ+"\">"+
                obj.participant_ID+"</a></td>"+
                "<td>"+obj.current_lesion_type+"</td>"+
                "<td>"+obj.age_at_diagnosis+"</td>"+
                "<td>"+obj.year_of_diagnosis+"</td>"+
                "<td>"+obj.lesion_type+"</td>"+
                "<td>"+obj.specimen_collected+"</td>"+
                "<td>"+obj.biomarker_tested+"</td>"+
                "<td><button type='submit' onclick='window.location.replace(\"https://mcl-labcas.jpl.nasa.gov/labcas-ui/d/index.html?dataset_id=PCA_Pilot_Data/Smart_3Seq_RNA_Sequencing/University_of_Vermont_Smart3Seq_Data\")' class='btn btn-primary'>Genomic File(s)</button> &nbsp;&nbsp;" +
              "<button type='submit' onclick='window.location.replace(\"https://mcl-labcas.jpl.nasa.gov/labcas-ui/d/index.html?dataset_id=PCA_Pilot_Data/Smart_3Seq_RNA_Sequencing/University_of_Vermont_Smart3Seq_Data\")' class='btn btn-info'>Image File(s)</button>" +
              "</td>"+
                "<td class=\"td-actions\">"+
						"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+site+"', 'FavoriteCollections')\" class=\"btn "+color+" btn-simple btn-link\">"+
							"<i class=\"fa fa-star\"></i>"+
						"</button>"+
					"</td>"+
            "</tr>");
            
         }
         }
    });
    $('#participant_len').html(clinicalcore_count);
    $('#organ_len').html(Object.keys(organ_list).length);
    $('#participant-loading').hide(500);
    $participant_table.bootstrapTable({
            toolbar: ".toolbar",
            clickToSelect: true,
            showRefresh: true,
            search: false,
            showToggle: true,
            showColumns: true,
            pagination: true,
            pageSize: 50,
            clickToSelect: false,
            pageList: [8, 10, 25, 50, 100],

            formatShowingRows: function(pageFrom, pageTo, totalRows) {
                //do nothing here, we don't want to show the text "showing x of y from..."
            },
            formatRecordsPerPage: function(pageNumber) {
              return pageNumber + " rows visible";
            },
            icons: {
               refresh: 'fa fa-refresh',
               toggle: 'fa fa-th-list',
               columns: 'fa fa-columns',
               detailOpen: 'fa fa-plus-circle',
               detailClose: 'fa fa-minus-circle'
           }
    });

    //activate the tooltips after the data table is initialized
    $('[rel="tooltip"]').tooltip();

    $(window).resize(function() {
        $table.bootstrapTable('resetView');
    });
}

function fill_clinicalcore_search(data){
    //filter search results before sending to populating function
    var search = localStorage.getItem("search");
    if (search == "*"){
        localStorage.setItem("search_flag", "false");
    }else{
        localStorage.setItem("search_flag", "true");
    }
    fill_clinicalcore_data(data);
}
function search_site_data(site, site_name, inst_name, organ){
    var search_flag = false;
    if ( localStorage.getItem("search_flag") != "true" || site_name.includes(localStorage.getItem("search")) || inst_name.includes(localStorage.getItem("search"))
        || organ.includes(localStorage.getItem("search")) || site.includes(localStorage.getItem("search"))){
        search_flag = true;
    }
    if (localStorage.getItem("site_filters_val") && JSON.parse(localStorage.getItem("site_filters_val")).length > 0) {
        if (localStorage.getItem("search") == "" || localStorage.getItem("search") == "*" ) {
            search_flag = false;
        }
        if (JSON.parse(localStorage.getItem("site_filters_val")).includes(site_name)){
            search_flag = true;
        }
    }

    return search_flag;
}

function fill_clinicalcore_data(data){
	//data.response.docs.sort(dataset_compare_sort);
    clinicalcore_dict = {};
    console.log("Start");
    console.log(data);
    $.each(data, function(index, obj) {
        console.log(obj);
    	var color = "btn-info";
		if(user_data["FavoriteCollections"].includes(obj.id)){
			color = "btn-success";
    	}
        var site = obj.siteID? obj.siteID: "None";

        if(!clinicalcore_dict[site]){ 
            //clinicalcore_dict[site] = {"organ_count":0,"participant_count":0, "specimen_count":0, "labcas_file":""};
            clinicalcore_dict[site] = {};
        }

        var organ = "None";
        $.each(obj.organs, function(index_org, obj_org) {
            if (obj_org.organType.includes("Organs")){
               obj_org.organType = obj_org.organType.replace("Organs","");
            }
            if (!clinicalcore_dict[site][obj_org.organType]){
                clinicalcore_dict[site][obj_org.organType] = {"participant_count":0, "specimen_count":0, "labcas_file":""};
            }
            organ = obj_org.organType;
            return;
        });
        //console.log("Organ");
        //console.log(organ);

        if (!clinicalcore_dict[site][organ]){
            clinicalcore_dict[site][organ] = {"participant_count":0, "specimen_count":0, "labcas_file":""};
        }
        //console.log("HERE");
        //console.log(site);
        clinicalcore_dict[site][organ]["participant_count"] += 1;
        //console.log(clinicalcore_dict[site][organ]);

        $.each(obj.biospecimens, function(index_bio, obj_bio) {
            if (obj_bio.anatomical_site == organ){
                clinicalcore_dict[site][organ]["specimen_count"] += 1;
            }
        });

        clinicalcore_dict[site][organ]["labcas_file"] = obj.labcasFileURL? localStorage.getItem("labcas_data_prefix")+obj.fileName+".xlsx": "";
        clinicalcore_dict[site][organ]["color"] = color;

    });

    search_ksdb_inst_site_data(Object.keys(clinicalcore_dict));


    $.each(clinicalcore_dict, function(site, site_obj) {
            var site_name = localStorage.getItem("site"+site);
            var inst_name = localStorage.getItem("inst"+site);
            $.each(site_obj, function(organ, obj) {
                  var search_flag = search_site_data(site, site_name, inst_name, organ);

                  if (search_flag){
                      $("#collection-table tbody").append(
                        "<tr>"+
                            "<td><a href=\"/clinical-ui/f/index.html?site_id="+
                                site+"&organ_id="+organ+"\">"+"<i class='fa fa-play'></i></td><td>"+
                            "<div class='site"+site+"'></div></td>"+
                            "<td><div class='inst"+site+"'></div></td>"+
                            "<td>"+organ+"</td>"+
                            "<td>"+obj["participant_count"]+"</td>"+
                            "<td>"+obj["specimen_count"]+"</td>"+
                            "<td><button type='submit' onclick='window.location.replace(\""+obj["labcas_file"]+"\")' class='btn btn-primary'>Labcas Dataset</button></td>"+
                            "<td class=\"td-actions\">"+
                                    "<center><button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+site+"', 'FavoriteCollections')\" class=\"btn "+obj["color"]+" btn-simple btn-link\">"+
                                        "<i class=\"fa fa-star\"></i>"+
                                    "</button></center>"+
                                "</td>"+
                        "</tr>");
                 }
            });
    });

    include_ksdb_inst_site_data(Object.keys(clinicalcore_dict));

    $('#loading').hide(500);
    $table.bootstrapTable({
            toolbar: ".toolbar",
            clickToSelect: true,
            showRefresh: true,
            search: false,
            showToggle: true,
            showColumns: true,
            pagination: true,
            pageSize: 50,
            clickToSelect: false,
            pageList: [8, 10, 25, 50, 100],

            formatShowingRows: function(pageFrom, pageTo, totalRows) {
                //do nothing here, we don't want to show the text "showing x of y from..."
            },
            formatRecordsPerPage: function(pageNumber) {
              return pageNumber + " rows visible";
            },
            icons: {
               refresh: 'fa fa-refresh',
               toggle: 'fa fa-th-list',
               columns: 'fa fa-columns',
               detailOpen: 'fa fa-plus-circle',
               detailClose: 'fa fa-minus-circle'
           }
    });

    //activate the tooltips after the data table is initialized
    $('[rel="tooltip"]').tooltip();

    $(window).resize(function() {
        $table.bootstrapTable('resetView');
    });
}
function search_ksdb_inst_site_data(siteids){
    $.ajax({
        url: localStorage.getItem('ksdb_institution_site_api'),
        type: 'GET',
        success: function (data) {
            data = JSON.parse(data);
            $.each(siteids, function(i, site) {
                localStorage.setItem("site"+site, data[site][1]);
                localStorage.setItem("inst"+site, data[site][0]);
                generate_biospecimen_site_facets(data[site][1]);
            });

        },
        error: function(e){
            if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
               localStorage.setItem("logout_alert","On");
                alert("You are currently logged out. Redirecting you to log in.");
            }
             //window.location.replace("/clinical-ui/index.html");
         }
    });
}
function include_ksdb_inst_site_data(siteids){
    /*$.ajax({
        url: localStorage.getItem('ksdb_institution_site_api'),
        type: 'GET',
        success: function (data) {
            data = JSON.parse(data);
            $.each(siteids, function(i, site) {
                $(".site"+site).html(data[site][1]);
                $(".inst"+site).html(data[site][0]);
                localStorage.setItem("site"+site, data[site][1]);
                localStorage.setItem("inst"+site, data[site][0]);
            });
        },
        error: function(e){
            if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
               localStorage.setItem("logout_alert","On");
                alert("You are currently logged out. Redirecting you to log in.");
            }
             //window.location.replace("/clinical-ui/index.html");

         }
    });*/
    $.each(siteids, function(i, site) {
        $(".site"+site).html(localStorage.getItem("site"+site));
        $(".inst"+site).html(localStorage.getItem("inst"+site));
    });

}
function fill_clinicalcore_details_data(data){
	console.log(data);
    if(!data){
        if(!Cookies.get("token") || Cookies.get("token") == "None"){
            localStorage.setItem("logout_alert","On");
            alert("You are currently logged out. Redirecting you to log in.");
            window.location.replace("/clinical-ui/index.html");
        }
    }
	var collectioname = data.participant_ID;
	$("#collectiontitle").html(collectioname);
	if (collectioname.length > 35){
		collectioname = collectioname.slice(0,35);
	}
	$("#collection_name").html(collectioname);
	
	var no_show_headers = ["dateFileGenerated","biospecimens","organs"];

    var show_headers = localStorage.getItem('specimen_header_order').split(',');
    var display_headers = localStorage.getItem('specimen_header_display').split(',');
    var additional_data = "";
	$.each(show_headers, function(idx, obj) {
        key = obj;
        value = data[obj];
		if (no_show_headers.includes(key)){
			return;
		}
		if (typeof  value === "undefined") {
            value = "";
        }
		if ($.isArray(value)){
			value = value.join(",");
		}
        if (value.length > 50){
            value = "<nobr>"+value.substring(0, 20) + "<a data-toggle='collapse' id='#"+key+"Less' href='#"+key+"Collapse' role='button' aria-expanded='false' onclick='document.getElementById(\"#"+key+"Less\").style.display = \"none\";'>... More</a></nobr><div class='collapse' id='"+key+"Collapse'>" + value.substring(20) + " <a data-toggle='collapse' href='#"+key+"Collapse' role='button' aria-expanded='false' onclick='document.getElementById(\"#"+key+"Less\").style.display = \"block\";'>Less</a></div>";
        }

        $("#collectiondetails-table tbody").append(
            "<tr>"+
				"<td class='text-right' valign='top' style='padding: 2px 8px;' width='31%'>"+display_headers[idx]+":</td>"+
				"<td class='text-left' valign='top' style='padding: 2px 8px;'>"+
					value+
				"</td>"+
			"</tr>");
		
    });
    
    $.each(data, function(idx, obj) {
        if (!show_headers.includes(idx)){
            additional_data += "<tr><td class='text-right' valign='top' style='padding: 2px 8px;'>"+idx+"</td><td class='text-left' valign='top' style='padding: 2px 8px;'>"+obj+"</td></tr>";
        }
    });

    $("#collectiondetails-table tbody").append(
            "<tr><td style='border: none;'><br>Additional demographic data: <br><a data-toggle='collapse' id='add_dataLess' href='#add_dataCollapse' role='button' aria-expanded='false' onclick='document.getElementById(\"add_dataLess\").style.display = \"none\"; document.getElementById(\"add_dataCollapse\").style.display = \"block\";'>... More</a></td></tr><tr><td><div id='add_dataCollapse' style='display: none;' ><table>"+additional_data+"<a data-toggle='collapse' href='#add_dataCollapse' role='button' aria-expanded='false' onclick='document.getElementById(\"add_dataLess\").style.display = \"block\"; document.getElementById(\"add_dataCollapse\").style.display = \"none\";'>Less</a></table></div></td></tr>"
         );


    var dataset_metadata_html = "No organ data available";

    var show_org_headers = localStorage.getItem('organ_header_order').split(',');
    var display_org_headers = localStorage.getItem('organ_header_display').split(',');
    var additional_organ_data = "";
    if (data.organs && data.organs[0]){
        //dataset_metadata_html = '<table class="table" id="metadatadetails-table" style="table-layout: fixed;"><thead><th>Organ</th><th>Site</th><th>Grade</th><th>Laterality</th></thead><tbody>';
        $.each(show_org_headers, function(idx, obj) {
            value = data.organs[0][obj];    
            console.log(value);
            //value.grade = value.grade? value.grade : "";
            //value.laterality = value.laterality? value.laterality : "";
            //value.site = value.site? value.site : "";
            //dataset_metadata_html+="<tr>"+"<td valign='top' style='padding: 2px 8px;' width='25%'>"+"<a href=\"#\">"+value.organType+"</a>"+"</td><td valign='top' style='padding: 2px 8px;' width='25%'>"+""+value.site+""+"</td><td valign='top' style='padding: 2px 8px;' width='25%'>"+""+value.grade+""+"</td><td valign='top' style='padding: 2px 8px;' width='25%'>"+""+value.laterality+""+"</td>"+
                    //"</tr>"
             $("#organdetails-table tbody").append(
            "<tr>"+
                "<td class='text-right' valign='top' style='padding: 2px 8px;'>"+display_org_headers[idx]+":</td>"+
                "<td class='text-left' valign='top' style='padding: 2px 8px;'>"+
                    value+
                "</td>"+
            "</tr>");

        });

        $.each(data.organs[0], function(idx, obj) {
            if (!show_org_headers.includes(idx)){
                additional_organ_data += "<tr><td class='text-right' valign='top' style='padding: 2px 8px;'>"+idx+"</td><td class='text-left' valign='top' style='padding: 2px 8px;'>"+obj+"</td></tr>";
            }
        });
        //dataset_metadata_html += "</tbody></table>";
         $("#organdetails-table tbody").append(
            "<tr><br><td style='border: none;'>Additional Organ Data: <br><a data-toggle='collapse' id='add_org_dataLess' href='#add_org_dataCollapse' role='button' aria-expanded='false' onclick='document.getElementById(\"add_org_dataLess\").style.display = \"none\"; document.getElementById(\"add_org_dataCollapse\").style.display = \"block\";'>... More</a></td></tr><tr><td><div id='add_org_dataCollapse' style='display: none;' ><table>"+additional_organ_data+"<a data-toggle='collapse' href='#add_org_dataCollapse' role='button' aria-expanded='false' onclick='document.getElementById(\"add_org_dataLess\").style.display = \"block\"; document.getElementById(\"add_org_dataCollapse\").style.display = \"none\";'>Less</a></table></div></td></tr>"
         );
    }
    $('#loading_metadata').hide(500);
    $('#organ_div').html(dataset_metadata_html);

    fill_specimen_table(data.biospecimens);
	$('#loading_collection').hide(500);    
}
function fill_genomic_table(data){
    $('#genomic_len').html(data.length);
}
function setup_specimen_detail(specimen_id){
    query_labcas_api(localStorage.getItem('environment')+"/specimens/"+specimen_id, setup_specimen_table);
}
function setup_specimen_table(data){
    $.each(data, function(idx, obj) {
        console.log(obj);
        if (idx != "__mcl.sickbay.model.specimens.Biospecimen__" && idx != "genomics") {
            $("#specimen-table tbody").append(
                "<tr>" +
                "<td class='text-right' valign='top' style='padding: 2px 8px;' width='20%'>" + idx + ":</td>" +
                "<td class='text-left' valign='top' style='padding: 2px 8px;'>" +
                obj +
                "</td>" +
                "</tr>");
        }
    });
}
function fill_specimen_table(data){
    var specimen_count = 0;
    var specimen_metadata_html = "No specimen data available";
    if (data){
        var get_var = get_url_vars();
        specimen_metadata_html = '<table class="table" id="metadatadetails-table" style="table-layout: fixed;"><thead><th>SpecimenID</th><th>Type</th><th>Analyte Type</th><th>Laterality</th></thead><tbody>';
        $.each(data, function(key, value) {
            
            if(localStorage.getItem("search_flag") != "true" || JSON.stringify(value).includes(localStorage.getItem("search"))){
                var specimen_url = "/clinical-ui/d/index.html?participant_id="+get_var["participant_id"]+"&site_id="+get_var["site_id"]+"&organ_id="+get_var["organ_id"]+"&specimen_id="+value.specimen_ID;

                value.specimen_type = value.specimen_type? value.specimen_type : "";
                value.specimen_laterality = value.specimen_laterality? value.specimen_laterality : "";
                value.analyte_type = value.analyte_type? value.analyte_type : "";
                specimen_metadata_html+="<tr>"+"<td valign='top' style='padding: 2px 8px;' width='25%'>"+"<a href=\""+specimen_url+"\">"+value.specimen_ID+"</a>"+"</td><td valign='top' style='padding: 2px 8px;' width='25%'>"+""+value.specimen_type+""+"</td><td valign='top' style='padding: 2px 8px;' width='25%'>"+""+value.analyte_type+""+"</td><td valign='top' style='padding: 2px 8px;' width='25%'>"+""+value.specimen_laterality+""+"</td>"+
                    "</tr>";
                specimen_count += 1;
            }
        });
        specimen_metadata_html += "</tbody></table>";
    }
    $('#loading_specimen').hide(500);
    $('#specimen_div').html(specimen_metadata_html);
    $('#specimen_len').html(specimen_count);
    if(data){
        var $specimen_table = $('#metadatadetails-table');
        $specimen_table.bootstrapTable({
            toolbar: ".toolbar",
            clickToSelect: true,
            showRefresh: true,
            search: false,
            showToggle: true,
            showColumns: true,
            pagination: true,
            searchAlign: 'left',
            pageSize: 50,
            clickToSelect: false,
            pageList: [8, 10, 25, 50, 100],

            formatShowingRows: function(pageFrom, pageTo, totalRows) {
                //do nothing here, we don't want to show the text "showing x of y from..."
            },
            formatRecordsPerPage: function(pageNumber) {
              return pageNumber + " rows visible";
            },
            icons: {
               refresh: 'fa fa-refresh',
               toggle: 'fa fa-th-list',
               columns: 'fa fa-columns',
               detailOpen: 'fa fa-plus-circle',
               detailClose: 'fa fa-minus-circle'
           }
        });
    }
}

function fill_dataset_details_data(data){
	var datasetname = data.response.docs[0].DatasetName;
	$("#datasettitle").html(datasetname);
	if (datasetname.length > 25){
		datasetname = datasetname.slice(0,25);
	}
	$("#collection_datasets_len").html(datasetname);
	
	var collectionid = data.response.docs[0].CollectionId;
	var collectionname = data.response.docs[0].CollectionName;
	$("#collection_name").html("<a href=\"/clinical-ui/c/index.html?collection_id="+collectionid+"\">"+collectionname+"</a>");
	
	var extended_headers = [];
        if (localStorage.getItem('dataset_header_extend_'+collectionid)){
                extended_headers = localStorage.getItem('dataset_header_extend_'+collectionid).split(',');
        }
    var show_headers = localStorage.getItem('dataset_header_order').split(',');
    var collection_id_append = localStorage.getItem('dataset_id_append').split(',');
	
	$.each(show_headers, function(ind, head) {
        var value = data.response.docs[0][head];
	if (typeof  value === "undefined") {
                        value = "";
                }
        if (!value){
            return;
        }
        
        if ($.isArray(value)){
            value = value.join(",");
        }
        if (typeof value == "string"){
			value = value.replace(/% /g,'_labcasPercent_');
			value = decodeURIComponent(value);
			value = value.replace(/\+/g,"&nbsp;").replace(/_labcasPercent_/g,'% ');
        }
        if (collection_id_append.includes(head)){
            value += " ("+data.response.docs[0][head+"Id"]+")";
        }
        $("#datasetdetails-table tbody").append(
            "<tr>"+
				"<td class='text-right'  valign='top' style='padding: 2px 8px;' width='20%'>"+head.replace( /([a-z])([A-Z])/g, "$1 $2" )+":</td>"+
				"<td class='text-left'  valign='top' style='padding: 2px 8px;'>"+
					value+
				"</td>"+
			"</tr>");
		
    });
	
	$.each(data.response.docs[0], function(key, value) {
		if (show_headers.includes(key) || !extended_headers.includes(key)){
		    return;
		}
		if (typeof  value === "undefined") {
                        value = "";
                }
		if ($.isArray(value)){
			value = value.join(",");
		}
		if (typeof value == "string"){
			value = value.replace(/% /g,'_labcasPercent_');
			try { 
				value = decodeURIComponent(value);
			} catch(e) { 
			  console.error(e); 
			}
			value = value.replace(/\+/g,"&nbsp;").replace(/_labcasPercent_/g,'% ');
        }
        
          $("#datasetdetails-table tbody").append(
            "<tr>"+
				"<td class='text-right'  valign='top' style='padding: 2px 8px;' width='20%'>"+key.replace( /([a-z:])([A-Z])/g, "$1 $2" )+":</td>"+
				"<td class='text-left' valign='top' style='padding: 2px 8px;'>"+
					value+
				"</td>"+
			"</tr>");
		
    });
}
function fill_file_details_data(data){
	$("#filetitle").html(data.response.docs[0].FileName);
	var html_safe_id = encodeURI(escapeRegExp(data.response.docs[0].id));
	var fileurl = "";
	if (data.response.docs[0].FileUrl){
		var url = data.response.docs[0].FileUrl;
		fileurl = "<a href='"+url+"'>"+url+"</a>";
	}
	var filesize = "";
	if (data.response.docs[0].FileSize){
		filesize = humanFileSize(data.response.docs[0].FileSize, true);
	}
	$.each(data.response.docs[0], function(key, value) {
		if (key == "_version_"){
			return;
		}
		if ($.isArray(value)){
			value = value.join(",");
		}
		if (key == "FileUrl"){
			value = fileurl;
		}
		if (key == "FileSize"){
			value = filesize;
		}
          $("#filedetails-table tbody").append(
            "<tr>"+
				"<td class='text-right'  valign='top' style='padding: 2px 8px;' width='20%'>"+key.replace( /([A-Z])/g, " $1" )+":</td>"+
				"<td class='text-left' valign='top' style='padding: 2px 8px;'>"+
					value+
				"</td>"+
			"</tr>");
		
    });
    $("#filesize").html(filesize); 
    $("#download_icon").attr("onclick","download_file('"+html_safe_id+"','single');");

	$('#loading').hide(500);
}
function fill_datasets_children(data){
	data.response.docs.sort(dataset_compare_sort);
        var dataset_html = "";
	var flag = "";
        $.each(data.response.docs, function(key, value) {
			if (flag == ""){
				flag = true;
				return;
			}
                        var color = "#0000FF";
                        if(user_data["FavoriteDatasets"].includes(value.id)){
                                color = "#87CB16 !important";
                        }       
			value.DatasetName = "&nbsp;&nbsp;&nbsp;&nbsp;".repeat(value.id.split("/").length - 2)+"<span>&#8226;</span>"+value.DatasetName;
			dataset_html += "<div class='row' style='border-bottom:1px solid #ccc; margin-left: 0px; margin-right: 0px;'>"+
                                        "<div class='col-md-1'><!--<div class=\"form-check\">"+
                                                "<label class=\"form-check-label\">"+
                                                        "<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
                                                        "<span class=\"form-check-sign\"></span>"+
                                                "</label>"+
                                        "</div>--></div>"+
                                        "<div class='text-left col-md-10' valign='middle' style='padding: 0px 8px; vertical-align: middle;'>"+
                        "<a href=\"/clinical-ui/d/index.html?dataset_id="+
                            value.id+"\">"+
                            value.DatasetName+
                        "</a>"+
                                        "</div>"+
                                        "<div class=\"td-actions col-md-1 text-right\" valign='middle' style='padding: 0px 8px; vertical-align: middle; height: 25px'>"+
                                                "<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+value.id+"', 'FavoriteDatasets')\" class=\"btn btn-simple btn-link\" style='position: absolute;left: 5px; top: 50%; transform: translateY(-50%); color: "+color+"'>"+
                                                        "<i class=\"fa fa-star\"></i>"+
                                                "</button>"+
                                        "</div>"+
                                "</div>";
                });
	if ( dataset_html != ""){
		$("#children-datasets").show();
	}
        $("#children-datasets-section").append(dataset_html);
}
function fill_datasets_metadata(data){
	var dataset_metadata_html = '<table class="table" id="metadatadetails-table" style="table-layout: fixed;">';
	$.each(data.response.docs, function(key, value) {
		console.log(key);
		console.log(value.id);
		var html_safe_id = encodeURI(escapeRegExp(value.id));
		console.log(html_safe_id);
		dataset_metadata_html+="<tr>"+
                                "<td valign='top' style='padding: 2px 8px;' width='100%'>"+"<center><a href='#' onclick=\"download_file('"+html_safe_id+"','single');\">"+value.FileName+"</a></center>"+"</td>"+
				"</tr>"
		size += 1;
	});
	dataset_metadata_html += "</table>";
	$('#loading_metadata').hide(500);
	$('#metadata_div').html(dataset_metadata_html);
}
function fill_datasets_data(data){

	data.response.docs.sort(dataset_compare_sort);
	var collapse_dict = {};
	var prev_dataset_id = "";
	var dataset_html = "";
	var dataset_attr ="";
	var collapse_button = "";

        var get_var = get_url_vars();
        var metadata_exists = false;
	$.each(data.response.docs, function(key, value) {
		if (value.id.split(/\//)[1] == get_var["collection_id"]){
			query_labcas_api(localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+value.id+"&wt=json&indent=true", fill_datasets_metadata);
			metadata_exists = true;
			return;
		}
		var html_safe_id = encodeURI(escapeRegExp(value.id));
		var color = "#0000FF";
		if(user_data["FavoriteDatasets"].includes(value.id)){
			color = "#87CB16 !important";
		}
		if (value.id.split("/").length - 2 > 0){
			if (collapse_dict[prev_dataset_id] == 1){
				dataset_html += "<div id='"+prev_dataset_id+"' class='collapse'>";
				collapse_dict[prev_dataset_id] += 1;
			}
			value.DatasetName = "&nbsp;&nbsp;&nbsp;&nbsp;".repeat(value.id.split("/").length - 2)+"<span>&#8226;</span>"+value.DatasetName;
			collapse_button = "";
		}else{
			if (prev_dataset_id != ""){
				dataset_html += "</div>";
			}
			prev_dataset_id = value.id.replace(/[\/,\.]/g,"_");
			collapse_button = '<button id="'+prev_dataset_id+'_button" style="height:25px; position: absolute; top: 30%; transform: translateY(-50%);" type="button" class="btn btn-link" data-toggle="collapse" data-target="#'+prev_dataset_id+'"><i class="fa fa-plus"></i></button>';
			collapse_dict[prev_dataset_id] = 1;
		}
		dataset_html += "<div class='row' style='border-bottom:1px solid #ccc; margin-left: 0px; margin-right: 0px;'>"+
				"<div class='col-md-1'><!--<div class=\"form-check\">"+
					"<label class=\"form-check-label\">"+
						"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
						"<span class=\"form-check-sign\"></span>"+
					"</label>"+
				"</div>-->"+collapse_button+"</div>"+
				"<div class='text-left col-md-10' valign='middle' style='padding: 0px 8px; vertical-align: middle;'>"+
		"<a href=\"/clinical-ui/d/index.html?dataset_id="+
		    value.id+"\">"+
		    value.DatasetName+
		"</a>"+
				"</div>"+
				"<div class=\"td-actions col-md-1 text-right\" valign='middle' style='padding: 0px 8px; vertical-align: middle; height: 25px'>"+
					"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+value.id+"', 'FavoriteDatasets')\" class=\"btn btn-simple btn-link\" style='position: absolute;left: -20px; top: 50%; transform: translateY(-50%); color: "+color+"'>"+
						"<i class=\"fa fa-star\"></i>"+
					"</button>"+
					"<button type=\"button\" rel=\"downloadbutton\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\" onclick=\"download_dataset('"+html_safe_id+"')\" style='position: absolute;left: 0px; top: 50%; transform: translateY(-50%); color: green;'>"+
                                        "<i class=\"fa fa-download\"></i>"+
					"</button>"+
				"</div>"+
			"</div>";
	});
	if (!metadata_exists){
                $('#collection_level_files').hide();
        }
	if ( dataset_html == "" ){
		$('#datasets_in_collection').hide();
	}
	if (prev_dataset_id != ""){
		dataset_html += "</div>";
	}

	$("#datasets-table").append(dataset_html);
	$.each(collapse_dict, function(key, value) {
		if (value == 1){
			$('#'+key+'_button').hide();
		}
	});
	    $("#collection_datasets_len").html(data.response.numFound);
	    $("#collection_favorites_len").html(user_data['FavoriteFiles'].length+user_data['FavoriteDatasets'].length+user_data['FavoriteCollections'].length);
	$('#loading_dataset').hide(500);
	$('#loading_metadata').hide(500);

}
function fill_files_data(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("files",size,cpage);
	$("#files-table tbody").empty();
	var download_list = JSON.parse(localStorage.getItem("download_list"));
	$.each(data.response.docs, function(key, value) {
	
		var color = "btn-info";
		if(user_data["FavoriteFiles"].includes(value.id)){
			color = "btn-success";
		}
		
		var thumb = "";
		var filetype = value.FileType ? value.FileType.join(",") : "";
		var site = value.Site ? value.Site.join(",") : "";
		var description = value.Description? value.Description.join(",") : "";
		if ('ThumbnailRelativePath' in value){
			thumb = "<img width='50' height='50' src='/clinical-ui/assets/"+value.ThumbnailRelativePath+"'/>";
		}
		var html_safe_id = encodeURI(escapeRegExp(value.id));
		var filesize = "";
		var filesizenum = 0;
		if (value.FileSize){
			filesize = humanFileSize(value.FileSize, true);
			filesizenum = value.FileSize;
		}
		var checked = "";
		if ( download_list &&  download_list.includes(html_safe_id) ){
			checked = "checked";
		}
		$("#files-table tbody").append(
		"<tr>"+
			"<td><center><input type='checkbox' class='form-check-input' value='"+html_safe_id+"' "+checked+" data-valuesize='"+filesizenum+"'></center></td>"+
			"<td class='text-left'>"+
				"<a href=\"/clinical-ui/f/index.html?file_id="+
					html_safe_id+"\">"+
					value.FileName+
				"</a>"+
			"</td>"+
			"<td class='text-left'>"+
					site +
			"</td>"+
			"<td class='text-left'>"+
					filetype +
			"</td>"+
			"<td class='text-left'>"+
					description +
			"</td>"+
			"<td class='text-left'>"+
					thumb+
			"</td>"+
			"<td class='text-left'>"+
					filesize+
			"</td>"+
			"<td class=\"td-actions text-right\">"+
				"<button type=\"button\" rel=\"favoritebutton\" title=\"Favorite\" onclick=\"save_favorite('"+value.id+"', 'FavoriteFiles')\" class=\"btn "+color+" btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
				"<button type=\"button\" rel=\"downloadbutton\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\" onclick=\"download_file('"+html_safe_id+"','single')\">"+
					"<i class=\"fa fa-download\"></i>"+
				"</button>"+
			"</td>"+
		"</tr>");	
	});                                                                     
    $("#collection_files_len").html(size); 
    $("#collection_favorites_len").html(user_data['FavoriteFiles'].length+user_data['FavoriteDatasets'].length+user_data['FavoriteCollections'].length);
    $('#loading_file').hide(500);
    if (size > 0){
	$("#children-files").show();
    }
}

function setup_biospecimen_main_data(datatype, query){
    query_labcas_api(localStorage.getItem('environment')+"/clinicalCores", fill_clinicalcore_data);
    /*$.ajax({
        url: localStorage.getItem('environment')+"/clinicalCores",
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", Cookies.get('Authorization')); 
        },
        type: 'GET',
        dataType: 'json',
        success: function (data) {

                //fill_clinicalcore_details_data(data);
                fill_clinicalcore_data(data);

        },
        error: function(e){
            if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                         localStorage.setItem("logout_alert","On");
                 alert("You are currently logged out. Redirecting you to log in.");
            }
            window.location.replace("/clinical-ui/index.html");
         }
    });*/
}
function setup_labcas_site(datatype, query_site, query_organ){ 
    $.ajax({
        url: localStorage.getItem('environment')+"/clinicalCores",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", Cookies.get('Authorization'));
        },
        type: 'GET',
        dataType: 'json',
        success: function (data) {

                fill_clinicalcore_participant(data, query_site, query_organ);

        },
        error: function(e){
            if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                         localStorage.setItem("logout_alert","On");
                 alert("You are currently logged out. Redirecting you to log in.");
            }
            window.location.replace("/clinical-ui/index.html");
         }
    });
}
function setup_biospecimen_site_data( query){
    $.ajax({
        url: localStorage.getItem('environment')+"/clinicalCores/"+query,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", Cookies.get('Authorization'));
        },
        type: 'GET',
        dataType: 'json',
        success: function (data) {
                fill_clinicalcore_details_data(data);
        },
        error: function(e){
            if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                         localStorage.setItem("logout_alert","On");
                 alert("You are currently logged out. Redirecting you to log in.");
            }
            //window.location.replace("/clinical-ui/index.html");
         }
    });
}


function populate_dataset_children(query){
	query = query.replace(/id:/,'DatasetParentId')+"%5C%2A";
	console.log(localStorage.getItem('environment')+"/data-access-api/datasets/select?q="+query+"&wt=json&indent=true&rows=10000&sort=id%20asc");
	$.ajax({
		url: localStorage.getItem('environment')+"/data-access-api/datasets/select?q="+query+"&wt=json&indent=true&rows=10000&sort=id%20asc",
		xhrFields: {
				withCredentials: true
		  },
		beforeSend: function(xhr, settings) {
			if(Cookies.get('token') && Cookies.get('token') != "None"){
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
			}
		},
		dataType: 'json',
		success: function (data) {
			fill_datasets_children(data);

		},
		error: function(e){
			if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
			   localStorage.setItem("logout_alert","On");
			    alert("You are currently logged out. Redirecting you to log in.");
			}
			 window.location.replace("/clinical-ui/index.html");

		 }
	});
	$('#loading_dataset').hide(500);
}
function setup_labcas_dataset_data(datatype, query, file_query, cpage){
    if (cpage == 0){ //if this isn't a pagination request and a default load
	console.log(localStorage.getItem('environment')+"/data-access-api/datasets/select?q="+query+"&wt=json&indent=true");
	$.ajax({
		url: localStorage.getItem('environment')+"/data-access-api/datasets/select?q="+query+"&wt=json&indent=true",
		xhrFields: {
				withCredentials: true
		  },
		beforeSend: function(xhr, settings) { 
			if(Cookies.get('token') && Cookies.get('token') != "None"){
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
			} 
		},
		dataType: 'json',
		success: function (data) {
			fill_dataset_details_data(data);
			populate_dataset_children(query);
		},
		error: function(e){
			if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
			   localStorage.setItem("logout_alert","On");
			    alert("You are currently logged out. Redirecting you to log in.");
			}
			 window.location.replace("/clinical-ui/index.html");
		 
		 }
	});
    }
    
    $.ajax({
        url: localStorage.getItem('environment')+"/data-access-api/files/select?q="+file_query+"&wt=json&indent=true&start="+cpage*10,
        xhrFields: {
                withCredentials: true
          },
        beforeSend: function(xhr, settings) { 
            if(Cookies.get('token') && Cookies.get('token') != "None"){
            	xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
            }
        },
        dataType: 'json',
        success: function (data) {
            fill_files_data(data);
        },
        error: function(e){
		if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                                   localStorage.setItem("logout_alert","On");
			     alert("You are currently logged out. Redirecting you to log in.");
		}
             window.location.replace("/clinical-ui/index.html");
             
         }
    });
}

function setup_labcas_file_data(datatype, query, file_query){
    $.ajax({
        url: localStorage.getItem('environment')+"/data-access-api/files/select?q="+query+"&wt=json&indent=true",
        xhrFields: {
                withCredentials: true
          },
        beforeSend: function(xhr, settings) { 
            if(Cookies.get('token') && Cookies.get('token') != "None"){
            	xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
            }
        },
        dataType: 'json',
        success: function (data) {
            fill_file_details_data(data);
        },
        error: function(e){
		if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
		   localStorage.setItem("logout_alert","On");
		     alert("You are currently logged out. Redirecting you to log in.");
		}
             window.location.replace("/clinical-ui/index.html");
             
         }
    });
}




/*Search Section*/

function fill_datasets_facets(data){
	//console.log("Data_facets_output");
	//console.log(data);
}

function fill_datasets_search(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("datasets_search",size,cpage);
	//console.log("datasets");
	//console.log(data);
	$("#search-dataset-table tbody").empty();

	//console.log(data);
	$.each(data.response.docs, function(key, obj) {
	  var color = "btn-info";
	  if(user_data["FavoriteDatasets"].includes(obj.id)){
			color = "btn-success";
	  }
	

	  $("#search-dataset-table tbody").append(
		"<tr>"+
			"<td>"+
			"<a href=\"/clinical-ui/d/index.html?dataset_id="+
                    obj.id+"\">"+
                obj.DatasetName+"</a></td>"+
                "<td><a href=\"/clinical-ui/c/index.html?collection_id="+
                    obj.CollectionId+"\">"+
                    	obj.CollectionName+"</a></td>"+
                "<!--<td>"+obj.DatasetVersion+"</td>-->"+
			"<td class=\"td-actions\">"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteDatasets')\" class=\"btn "+color+" btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
			"</td>"+
		"</tr>");	
	});                

	$("#collection_datasets_len").html(size); 
	$('#loading_dataset').hide(500);
}

function fill_files_facets(data){
	
}
function fill_files_search(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("files_search",size,cpage);
	$("#search-file-table tbody").empty();
	$.each(data.response.docs, function(key, obj) {
	  var color = "btn-info";
	  if(user_data["FavoriteFiles"].includes(obj.id)){
			color = "btn-success";
	  }

	  var thumb = "";
	  var filetype = obj.FileType ? obj.FileType.join(",") : "";
	  var site = obj.Site ? obj.Site.join(",") : "";
	  var description = obj.Description? obj.Description.join(",") : "";
	  if ('ThumbnailRelativePath' in obj){
		thumb = "<img width='50' height='50' src='/clinical-ui/assets/"+obj.ThumbnailRelativePath+"'/>";
  	  }
	  var filesize = "";
	  if (obj.FileSize){
  		filesize = humanFileSize(obj.FileSize, true);
          }
	  var html_safe_id = encodeURI(escapeRegExp(obj.id));
	  var checked = "";
	  var download_list = JSON.parse(localStorage.getItem("download_list"));
	  //console.log(html_safe_id);
	  //console.log(download_list);
	  if ( download_list &&  download_list.includes(html_safe_id) ){
		checked = "checked";
      	  }

	  $("#search-file-table tbody").append(
		"<tr>"+
			"<td><center><input type='checkbox' class='form-check-input' value='"+html_safe_id+"' "+checked+"></center></td>"+
			"<td class='text-left'>"+
				"<a href=\"/clinical-ui/f/index.html?file_id="+
					html_safe_id+"\">"+
					obj.FileName+
				"</a>"+
			"</td>"+
			"<td class='text-left'>"+
					filetype +
			"</td>"+
			"<td class='text-left'>"+
					site +
			"</td>"+
			"<td class='text-left'>"+
					description +
			"</td>"+
			"<td class='text-left'>"+
					thumb+
			"</td>"+
			"<td class='text-left'>"+
					filesize+
			"</td>"+
			"<td class=\"td-actions\">"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteFiles')\" class=\"btn "+color+" btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
			"</td>"+
		"</tr>");	
	});              
	$("#collection_files_len").html(size); 
	$('#loading_file').hide(500);
}
function generate_filters(field_type, placeholder, data, display, head){
	var filters = [];
	var counts = [];

	$("#filter_options").append(
		'<div class="card-header '+head+'_card">'+
		    '<h5 class="card-title">'+display+'</h5>'+
		    '<hr style="margin-top: .5em; margin-bottom: 0">'+
		'</div>'+
		'<div id="'+placeholder+'_card" class="card-body '+head+'_card" style="padding: 0px 15px 10px 15px; height: 20px; overflow-y: auto;">'+
		       '<form id="'+placeholder+'">'+
			'</form>'+
		'</div>'
	);

	$("#"+placeholder).html("");

	    console.log(data);

		$.each(data, function(key, obj) {
			counts.push(obj);
			filters.push(key);
		});
		var filter_count = 0;
		$.each(filters, function(i, o){
			if (localStorage.getItem(placeholder+"_val") && localStorage.getItem(placeholder+"_val") != ""){
			}
		    if (counts[i] > 0){
			var checked = "";
			if (localStorage.getItem(placeholder+"_val") && localStorage.getItem(placeholder+"_val").includes($.trim(o))){
				checked = "checked";
			}
			$("#"+placeholder).append($(' <div class="row"><div class="col-md-9">'+$.trim(o)+" ("+$.trim(counts[i])+')</div><div class="col-md-3"><input type="checkbox" '+checked+' name="'+placeholder+'[]" value="'+$.trim(o)+'" data-toggle="switch" data-on-color="info" data-off-color="info" data-on-text="<i class=\'fa fa-check\'></i>" data-off-text="<i class=\'fa fa-times\'></i>"><span class="toggle"></span></div></div>'));
			filter_count += 1;
		    }
		});
		var filter_height = filter_count*50;
		if (filter_height > 90){
			filter_height = 200;
		}
		$('#'+placeholder+'_card').css("height",filter_height.toString()+"px");
	
		$('input[name="'+placeholder+'[]"]').change(function() {
		    var field_val = [];
		    $("input[name='"+placeholder+"[]']").each(function (index, obj) {
			if(this.checked) {
			    field_val.push(this.value);
			}
		    });
		    var field_search = "";
		    localStorage.setItem(placeholder, field_search);
		    localStorage.setItem(placeholder+"_val",JSON.stringify(field_val));
		    localStorage.setItem("search_filter", "on");
		    setup_labcas_search(localStorage.getItem('search'), "all", 0);
		});
}

function generate_categories(field_id){
	$('#'+field_id).empty();
	$("#filter_options").empty();
	$.each(localStorage.getItem("filters").split(","), function(ind, head) {
		if (localStorage.getItem("faceted_categories_selected") == head){
			$('#'+field_id).append("<option value='"+head+"' selected>"+head+" Filters</option>");
		}else{
			$('#'+field_id).append("<option value='"+head+"'>"+head+" Filters</option>");
		}
		var ids = localStorage.getItem(head+"_filters_id").split(",");
		var displays = localStorage.getItem(head+"_filters_display").split(",");
		var divs = localStorage.getItem(head+"_filters_div").split(",");
		var facets = JSON.parse(localStorage.getItem("facets"));
		console.log("FACETS");
		console.log(facets);
		$.each(ids, function(i, idhead) {
			generate_filters(idhead,$.trim(divs[i]), facets[idhead.toLowerCase()], $.trim(displays[i]), $.trim(head));
		});
	});
}
function fill_collections_facets(){
	//console.log(data);
    var facets = JSON.parse(localStorage.getItem("facets"));
	if(!facets["datasettype"] || !facets["organ"] || !facets["site"]){
	    return;
    }
   	if (localStorage.getItem("search_filter") == "on" || (localStorage.getItem("search") && localStorage.getItem("search") != "*")){
		$('#filter_reset').show();
	}else{
		$('#filter_reset').hide();
	}
	generate_categories("faceted_categories");
	$("#faceted_categories").change(function(){
		$.each(localStorage.getItem("filters").split(","), function(ind, head) {
			$("."+head+"_card").hide();
		});
		$(".Core_card").show();
		$(this).find("option:selected").each(function(){
		    var optionValue = $(this).attr("value");
	 	    localStorage.setItem("faceted_categories_selected", optionValue);
		    $("."+optionValue+"_card").show();
		});
		reset_search_filters();
		setup_labcas_search("*", "all", 0);
	});
	$.each(localStorage.getItem("filters").split(","), function(ind, head) {
		$("."+head+"_card").hide();
	});
	$(".Core_card").show();
	$("."+localStorage.getItem("faceted_categories_selected")+"_card").show();
}
function fill_collections_search(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("collections_search",size,cpage);
	$("#search-collection-table tbody").empty();
	//data.response.docs.sort(dataset_compare_sort);
	$.each(data.response.docs, function(key, obj) {
	  var color = "btn-info";
	  if(user_data["FavoriteCollections"].includes(obj.id)){
			color = "btn-success";
	  }
	  $("#search-collection-table tbody").append(
		"<tr>"+
			"<td>"+
			"<a href=\"/clinical-ui/c/index.html?collection_id="+
                    obj.id+"\">"+
                obj.CollectionName+"</a></td>"+
                "<td>"+obj.Organ+"</td>"+
                "<td>"+obj.Discipline+"</td>"+
                "<td>"+obj.Institution+"</td>"+
                "<td>"+obj.LeadPI+"</td>"+
			"<td class=\"td-actions\">"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\"  onclick=\"save_favorite('"+obj.id+"', 'FavoriteCollections')\" class=\"btn "+color+" btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
			"</td>"+
		"</tr>");	
	});                                                                     
    $("#collection_name").html(size); 
    $('#loading_collection').hide(500);
}

function generate_biospecimen_site_facets(site) {
    var facets = JSON.parse(localStorage.getItem("facets"));
    if(!facets){
        facets = {"site":{}};
    }
    if(!facets["site"]){
        facets["site"] = {};
    }
    if(!facets["site"][site]){
        facets["site"][site] = 0;
    }
    facets["site"][site] += 1;

    localStorage.setItem("facets", JSON.stringify(facets))
    fill_collections_facets();
}

function generate_biospecimen_genomics_facets(data) {
    var facets = JSON.parse(localStorage.getItem("facets"));
    if(!facets){
        facets = {"datasettype":{}};
    }
    if(!facets["datasettype"]){
        facets["datasettype"] = {};
    }
    facets["datasettype"]["genomics"] = data.length;
    localStorage.setItem("facets", JSON.stringify(facets));
    fill_collections_facets();
}

function generate_biospecimen_images_facets(data) {
    var facets = JSON.parse(localStorage.getItem("facets"));
    if(!facets){
        facets = {"datasettype":{}};
    }
    if(!facets["datasettype"]){
        facets["datasettype"] = {};
    }
    facets["datasettype"]["images"] = data.length;
    localStorage.setItem("facets", JSON.stringify(facets));
    fill_collections_facets();
}

function generate_biospecimen_organs_facets(data) {
    var facets = JSON.parse(localStorage.getItem("facets"));
    if(!facets){
        facets = {"organ":{}};
    }
    if(!facets["organ"]){
        facets["organ"] = {};
    }

    $.each(data, function(ind, org) {
        o = org.organType.replace("Organs","");
        if(!facets["organ"][o]){
            facets["organ"][o] = 0;
        }
        facets["organ"][o] += 1;
    });
    localStorage.setItem("facets", JSON.stringify(facets))
    fill_collections_facets();
}

function setup_labcas_search(query, divid, cpage){
    //console.log("Searching...");

	/*var collection_filters = "";
	var collection_facets = [];
	$.each(localStorage.getItem("filters").split(","), function(ind, head) {
		var divs = localStorage.getItem(head+"_filters_div").split(",");
		$.each(divs, function(i, divhead) {
			collection_filters += localStorage.getItem($.trim(divhead));
		});
		collection_facets = collection_facets.concat(localStorage.getItem(head+"_filters_id").split(","));
	});*/
    $('#collection-table tbody').empty()
    $('#participant-table tbody').empty();
    $('#metadatadetails-table tbody').empty();
    wait(1000);
	var data_filters = "";
    if (divid == "site_search" || divid == "all"){
        localStorage.setItem("facets", false)

        query_labcas_api(localStorage.getItem('environment')+"/clinicalCores", fill_clinicalcore_search);
        query_labcas_api(localStorage.getItem('environment')+"/images", generate_biospecimen_images_facets);
        query_labcas_api(localStorage.getItem('environment')+"/genomics", generate_biospecimen_genomics_facets);
        query_labcas_api(localStorage.getItem('environment')+"/organs", generate_biospecimen_organs_facets);

    }
    if (divid == "datasets_search" || divid == "all"){

        var search = localStorage.getItem("search");
        if (search == "*"){
            localStorage.setItem("search_flag", "false");
        }else{
            localStorage.setItem("search_flag", "true");
        }
        query_labcas_api(localStorage.getItem('environment')+"/clinicalCores", fill_clinicalcore_participant);

    }
    if (divid == "files_search" || divid == "all"){
        query_labcas_api(localStorage.getItem('environment')+"/specimens", fill_specimen_table);
        query_labcas_api(localStorage.getItem('environment')+"/genomics", fill_genomic_table);
	}
}
/* End Search Section */


/*Starred Section*/
function fill_datasets_starred(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	$("#starred-dataset-table tbody").empty();
	$.each(data.response.docs, function(key, obj) {
	  if(user_data["FavoriteDatasets"].includes(obj.id)){
		  var color = "btn-success";
	  
	
		  $("#starred-dataset-table tbody").append(
			"<tr>"+
				"<td><!--<div class=\"form-check\">"+
					"<label class=\"form-check-label\">"+
						"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
						"<span class=\"form-check-sign\"></span>"+
					"</label>"+
				"</div>--></td><td>"+
				"<a href=\"/clinical-ui/d/index.html?dataset_id="+
						obj.id+"\">"+
					obj.DatasetName+"</a></td>"+
					"<td><a href=\"/clinical-ui/c/index.html?collection_id="+
						obj.CollectionId+"\">"+
							obj.CollectionName+"</a></td>"+
				"<td class=\"td-actions\">"+
					"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteDatasets')\" class=\"btn "+color+" btn-simple btn-link\">"+
						"<i class=\"fa fa-star\"></i>"+
					"</button>"+
				"</td>"+
			"</tr>");	
		  }
	});                
	$("#datasets_len").html(size); 
}
function fill_files_starred(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	$("#starred-file-table tbody").empty();
	$.each(data.response.docs, function(key, obj) {
		  var color = "btn-success";
	  
		  var filetype = obj.FileType ? obj.FileType.join(",") : "";
		  var description = obj.Description? obj.Description.join(",") : "";
		var thumb = "";
		  if ('ThumbnailRelativePath' in obj){
			thumb = "<img width='50' height='50' src='/clinical-ui/assets/"+obj.ThumbnailRelativePath+"'/>";
		  }
		var filesize = "";
		  if (obj.FileSize){
			filesize = humanFileSize(obj.FileSize, true);
		  }     
		  $("#starred-file-table tbody").append(
			"<tr>"+
				"<td><!--<div class=\"form-check\">"+
					"<label class=\"form-check-label\">"+
						"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
						"<span class=\"form-check-sign\"></span>"+
					"</label>"+
				"</div>--></td>"+
				"<td class='text-left'>"+
					"<a href=\"/clinical-ui/f/index.html?file_id="+
						obj.id+"\">"+
						obj.FileName+
					"</a>"+
				"</td>"+
				"<td class='text-left'>"+
						filetype +
				"</td>"+
				"<td class='text-left'>"+
						description +
				"</td>"+
				"<td class='text-left'>"+
						thumb+
				"</td>"+
				"<td class='text-left'>"+
						filesize+
				"</td>"+
				"<td class=\"td-actions\">"+
					"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteFiles')\" class=\"btn "+color+" btn-simple btn-link\">"+
						"<i class=\"fa fa-star\"></i>"+
					"</button>"+
				"</td>"+
			"</tr>");	
	});              
	$("#files_len").html(size); 
}

function fill_collections_starred(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	$("#starred-collection-table tbody").empty();
	
	$.each(data.response.docs, function(key, obj) {
	  if(user_data["FavoriteCollections"].includes(obj.id)){
		  var color = "btn-success";
	  
		  $("#starred-collection-table tbody").append(
			"<tr>"+
				"<td><!--<div class=\"form-check\">"+
					"<label class=\"form-check-label\">"+
						"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
						"<span class=\"form-check-sign\"></span>"+
					"</label>"+
				"</div>--></td><td>"+
				"<a href=\"/clinical-ui/c/index.html?collection_id="+
						obj.id+"\">"+
					obj.CollectionName+"</a></td>"+
					"<td>"+obj.Organ+"</td>"+
					"<td>"+obj.Discipline+"</td>"+
					"<td>"+obj.Institution+"</td>"+
					"<td>"+obj.LeadPI+"</td>"+
				"<td class=\"td-actions\">"+
					"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\"  onclick=\"save_favorite('"+obj.id+"', 'FavoriteCollections')\" class=\"btn "+color+" btn-simple btn-link\">"+
						"<i class=\"fa fa-star\"></i>"+
					"</button>"+
				"</td>"+
			"</tr>");	
		}
	});                                                                     
    $("#collections_len").html(size); 
    $('#loading').hide(500);
    
}

function setup_labcas_starred(query, divid, cpage){
	var collection_starred_search = "";
	if (user_data["FavoriteCollections"].length > 0){
		collection_starred_search = "&fq=(id:"+user_data["FavoriteCollections"].map(x => encodeURI(escapeRegExp(String(x)))).join(" OR id:")+")";
	}
	var dataset_starred_search = "";
	if (user_data["FavoriteDatasets"].length > 0){
		dataset_starred_search = "&fq=(id:"+user_data["FavoriteDatasets"].map(x => encodeURI(escapeRegExp(String(x)))).join(" OR id:")+")";
	}
	var file_starred_search = "";
	if (user_data["FavoriteFiles"].length > 0){
		var tmp_files_search = user_data["FavoriteFiles"].map(x => encodeURI(escapeRegExp(String(x)))).join(" OR id:").replace(/ *\([^)]*\) */g, "*");
		file_starred_search = "&fq=(id:"+tmp_files_search+")";
	}
    //console.log("Loading data...");
    if (divid == "collections_starred" || divid == "all"){
        console.log(localStorage.getItem('environment')+"/data-access-api/collections/select?q=*"+collection_starred_search+"&wt=json&indent=true&start="+cpage*10);
		$.ajax({
			url: localStorage.getItem('environment')+"/data-access-api/collections/select?q=*"+collection_starred_search+"&wt=json&indent=true&sort=id%20asc&start="+cpage*10,	
			beforeSend: function(xhr) {
				if(Cookies.get('token') && Cookies.get('token') != "None"){
					xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
				}
			},
			type: 'GET',
			dataType: 'json',
			success: function (data) {
				fill_collections_starred(data);
			},
			error: function(e){
				if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
				   localStorage.setItem("logout_alert","On");
				   alert("You are currently logged out. Redirecting you to log in.");
				}
				 window.location.replace("/clinical-ui/index.html");
			 }
		});
    }
    if (divid == "datasets_starred" || divid == "all"){
        $.ajax({
            url: localStorage.getItem('environment')+"/data-access-api/datasets/select?q=*"+dataset_starred_search+"&wt=json&indent=true&start="+cpage*10,
            beforeSend: function(xhr) {
                if(Cookies.get('token') && Cookies.get('token') != "None"){
					xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
				}
            },
            type: 'GET',
            dataType: 'json',
            processData: false,
            success: function (data) {
                fill_datasets_starred(data);
            },
            error: function(e){
		if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                   localStorage.setItem("logout_alert","On");
                   alert("You are currently logged out. Redirecting you to log in.");
		}
             }
        });
    }
    
    if (divid == "files_starred" || divid == "all"){
		console.log(localStorage.getItem('environment')+"/data-access-api/files/select?q=*"+file_starred_search+"&wt=json&indent=true&start="+cpage*10);
		
		$.ajax({
			url: localStorage.getItem('environment')+"/data-access-api/files/select?q=*"+file_starred_search+"&wt=json&indent=true&start="+cpage*10,
			xhrFields: {
					withCredentials: true
			  },
			beforeSend: function(xhr, settings) { 
				if(Cookies.get('token') && Cookies.get('token') != "None"){
					xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
				}
			},
			dataType: 'json',
			success: function (data) {
			 //console.log(data);
				fill_files_starred(data);
			},
			error: function(e){
				if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                                   localStorage.setItem("logout_alert","On");
				   alert("You are currently logged out. Redirecting you to log in.");
				}
			 
			 }
		});
	}
	$("#favorites_len").html(user_data['FavoriteFiles'].length+user_data['FavoriteDatasets'].length+user_data['FavoriteCollections'].length);
}

/* Starred Section End */
