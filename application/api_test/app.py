from flask import Flask
from flask import request
import requests
import json
import pandas as pd

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False


def fetch_data(query_name):
    response = requests.get(f"http://127.0.0.1:8091/epcis/v2/queries/{query_name}/events", verify=False)
    json_object = json.loads(response.text)
    event = json_object['epcisBody']['queryResults']['resultBody']['eventList']

    data = []

    for e in event:
        row_data = {
            'eventTime': e['eventTime'],
            'eventTimeZoneOffset': e['eventTimeZoneOffset'],
            'type': e['type'],
            'action': e['action'],
            'bizStep': e['bizStep'],
            'disposition': e.get('disposition'), 
            'epcList': e['epcList'][0],
            'readPoint': e['readPoint']['id'],
            'bizLocation': e['bizLocation']['id'],
            'sourceList_type': e['sourceList'][0]['type'] if 'sourceList' in e and e['sourceList'] and 'type' in e['sourceList'][0] else None,
            'sourceList_source': e['sourceList'][0]['source'] if 'sourceList' in e and e['sourceList'] and 'source' in e['sourceList'][0] else None,
            'destinationList_type': e['destinationList'][0]['type'] if 'destinationList' in e and e['destinationList'] and 'type' in e['destinationList'][0] else None,
            'destinationList_source': e['destinationList'][0]['destination'] if 'destinationList' in e and e['destinationList'] and 'destination' in e['destinationList'][0] else None,
        }

        data.append(row_data)

    return data

def fetch_data_mro(query_name) :
    response = requests.get(f"http://127.0.0.1:8091/epcis/v2/queries/{query_name}/events", verify=False)
    json_object = json.loads(response.text)
    event = json_object['epcisBody']['queryResults']['resultBody']['eventList']

    df = pd.DataFrame()

    for e in event:
        row_data = {
            'eventTime': e['eventTime'],
            'eventTimeZoneOffset': e['eventTimeZoneOffset'],
            'type': e['type'],
            'action': e['action'],
            'bizStep': e['bizStep'],
            'disposition': e.get('disposition'), 
            'epcList': e['epcList'][0],
            'readPoint': e['readPoint']['id'],
            'bizLocation': e['bizLocation']['id'],
            'MRO:company': e.get('MRO:company'),
            'MRO:manager': e.get('MRO:manager'),
            'MRO:contact': e.get('MRO:contact'),
            'MRO:contents': e.get('MRO:contents')
        }
        df = df.append(row_data, ignore_index=True)

    return df

def asset_status(query_name):
    data = fetch_data(query_name)
    df = pd.DataFrame(data)
    # df['eventTime'] = pd.to_datetime(df['eventTime'])

    q_epcs = requests.get("http://127.0.0.1:8091/epcis/v2/epcs",verify=False)
    epcs_json = json.loads(q_epcs.text)
    epcs = epcs_json['member']

    status_data = []
    location_status_data = []

    for epc in epcs:
        df_epc = df[df['epcList'] == epc]

        diposition_info = df_epc[df_epc['disposition'].notnull()]
        diposition_info.sort_values('eventTime', axis=0, ascending=False, inplace=True)
        diposition_info.reset_index(drop=True, inplace=True)

        source_info = df_epc[df_epc['disposition'].isnull()]
        source_info.sort_values('eventTime', axis=0, ascending=False, inplace=True)
        source_info.reset_index(drop=True, inplace=True)

        if not source_info.empty:
            e_time = source_info["eventTime"][0]
            n_location = source_info["destinationList_source"][0]
            p_location = source_info["sourceList_source"][0]
        else:
            e_time = diposition_info["eventTime"][0]
            status = diposition_info["disposition"][0]
            n_location = diposition_info["readPoint"][0] # 자산이동이 없는 경우
            p_location = None

        row_status = {
            "상태변경일": e_time,
            "자산": epc,
            "상태": status,
            "현재위치": n_location,
        }

        row_location_status = {
            "위치변경일": e_time,
            "자산": epc,
            "현재위치": n_location,
            "지난위치": p_location,
        }

        status_data.append(row_status)
        location_status_data.append(row_location_status)

    return status_data, location_status_data

def mro_status(query_name):
    data = fetch_data_mro(query_name)
    df = pd.DataFrame(data)

    q_epcs = requests.get("http://127.0.0.1:8091/epcis/v2/epcs",verify=False)
    epcs_json = json.loads(q_epcs.text)
    epcs = epcs_json['member']

    mro_data = []

    for epc in epcs:
        try:
            df_epc = df[df['epcList'] == epc]
            df_epc.sort_values('eventTime', axis=0, ascending=False, inplace=True)
            df_epc.reset_index(drop=True, inplace=True)

            for i in range(len(df_epc)):
                row_data = {
                    "현재위치": df_epc["readPoint"][i],
                    "자산": epc,
                    "유지보수일": df_epc["eventTime"][i],
                    "점검내용": df_epc["bizStep"][i],
                    "유지보수내용": df_epc["disposition"][i],
                    "관리업체": df_epc["MRO:company"][i],
                    "담당자": df_epc["MRO:manager"][i],
                    "담당연락처": df_epc["MRO:contact"][i],
                    "기타": df_epc["MRO:contents"][i]
                }

                mro_data.append(row_data) 

        except KeyError:
            pass

        unique_assets = df["epcList"].unique()

    return mro_data, unique_assets

def draw_table(data, table_name):
    # Get the column names from the data dictionary keys
    column_names = list(data[0].keys()) if data else []

    # Generate the HTML table with dynamic column names and data
    table_html = f"<h1>Data Table({table_name})</h1>"
    table_html += "<style>thead th { border-bottom: 2px solid black; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 8px; } th { background-color: #f2f2f2; }</style>"
    table_html += "<table>"
    table_html += "<tr>"
    for column in column_names:
        table_html += f"<th>{column}</th>"
    table_html += "</tr>"

    for row in data:
        table_html += "<tr>"
        for column in column_names:
            table_html += f"<td>{row[column]}</td>"
        table_html += "</tr>"

    table_html += "</table>"
    return table_html

def draw_table2(data, table_name):
    # Your existing code to generate the table HTML
    column_names = list(data[0].keys()) if data else []

    # Generate the HTML table with dynamic column names and data
    table_html = f"<h1>Data Table({table_name})</h1>"
    table_html += "<style>thead th { border-bottom: 2px solid black; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 8px; } th { background-color: #f2f2f2; }</style>"
    table_html += "<table>"
    table_html += "<tr>"
    for column in column_names:
        table_html += f"<th>{column}</th>"
    table_html += "</tr>"

    for row in data:
        table_html += "<tr class='asset-row' data-asset='{asset}'>"
        for column in column_names:
            table_html += f"<td>{row[column]}</td>"
        table_html += "</tr>"

    table_html += "</table>"
    return table_html


@app.route('/', methods=['GET'])
def main():
    data = fetch_data('objectevent')
    
    return draw_table(data, 'objectevent')


@app.route('/status', methods=['GET'])
def status1():
    status, location_status = asset_status('status')

    return draw_table(status, 'status infomation')

@app.route('/location_status', methods=['GET'])
def status2():
    status, location_status = asset_status('status')

    return draw_table(location_status, 'location status infomation')

@app.route('/mro_status', methods=['GET','POST'])
def status3():
    data, unique_assets = mro_status('MRO')

    if request.method == 'POST':
        # Get the selected asset from the submitted form
        selected_asset = request.form.get('selected_asset', None)
    else:
        # If no form submission, show data for all assets
        selected_asset = None

    # Filter the data based on the selected asset (if any)
    filtered_data = [row for row in data if not selected_asset or row['자산'] == selected_asset]

    # Debug lines to check the data and attribute values
    print("data:", data)
    print("filtered_data:", filtered_data)
    for row in data:
        print("Attribute value:", row['자산'])

    # Generate the HTML table with filtered data and the dropdown menu
    table_html = draw_table2(filtered_data, "Data")

    # Create the dropdown menu
    dropdown_options = "<select id='selected_asset' name='selected_asset'>"
    for asset in unique_assets:
        # If the asset is the selected one, add 'selected' attribute to the option
        selected_attr = 'selected' if asset == selected_asset else ''
        dropdown_options += f"<option value='{asset}' {selected_attr}>{asset}</option>"
    dropdown_options += "</select>"

    # Create the Apply button
    apply_button = "<button id='apply-button'>Apply</button>"

    table_container = f"<div id='table-container'>{table_html}</div>"

    js_script = """
        <script>
            // ... (rest of the JavaScript code remains unchanged)
        </script>
    """

    html_content = f"<html><body>{dropdown_options}{apply_button}{table_container}{js_script}</body></html>"

    return html_content



if __name__ == '__main__':
    app.run(debug=True)
