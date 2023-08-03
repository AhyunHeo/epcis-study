from flask import Flask
import requests
import json
import pandas as pd

app = Flask(__name__)

def fetch_data(query_name):
    q_response = requests.get(f"https://127.0.0.1:8091/epcis/v2/queries/{query_name}/events", verify=False)
    json_object = json.loads(q_response.text)
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
            'management:company': e.get('management:company'),
            'sourceList_type': e['sourceList'][0]['type'] if 'sourceList' in e and e['sourceList'] and 'type' in e['sourceList'][0] else None,
            'sourceList_source': e['sourceList'][0]['source'] if 'sourceList' in e and e['sourceList'] and 'source' in e['sourceList'][0] else None,
            'destinationList_type': e['destinationList'][0]['type'] if 'destinationList' in e and e['destinationList'] and 'type' in e['destinationList'][0] else None,
            'destinationList_source': e['destinationList'][0]['destination'] if 'destinationList' in e and e['destinationList'] and 'destination' in e['destinationList'][0] else None,
        }
        data.append(row_data)

    return data

def status(query_name):
    data = fetch_data(query_name)
    df = pd.DataFrame(data)
    # df['eventTime'] = pd.to_datetime(df['eventTime'])

    q_epcs = requests.get("https://127.0.0.1:8091/epcis/v2/epcs",verify=False)
    epcs_json = json.loads(q_epcs.text)
    epcs = epcs_json['member']

    new_data = []

    for epc in epcs:
        df_idf = df[df['epcList'] == epc]

        result = df_idf.sort_values('eventTime', ascending=False)
        diposition_info = result[result['disposition'].isnull() != True]
        source_info = result[result['disposition'].isnull() == True]

        status = diposition_info.reset_index(drop=True).loc[0,"disposition"]
        status_date = diposition_info.reset_index(drop=True).loc[0,"eventTime"]
        now_location = diposition_info.reset_index(drop=True).loc[0,"readPoint"]
        last_location = source_info.reset_index(drop=True).loc[0,"sourceList_source"]
        finally_move_date = source_info.reset_index(drop=True).loc[0,"eventTime"]

        row_data = {
            "자산": epc,
            "상태": status,
            "상태변경일": status_date,
            "현재위치": now_location,
            "지난위치": last_location,
            "마지막이동일": finally_move_date
        }

        new_data.append(row_data)

    return new_data

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


@app.route('/', methods=['GET'])
def main():
    data = fetch_data('objectevent')
    
    return draw_table(data, 'objectevent')


@app.route('/status', methods=['GET'])
def end_staus():
    data = status('status')

    return draw_table(data, 'status infomation')



if __name__ == '__main__':
    app.run(debug=True)
