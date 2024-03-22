from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import json

app = FastAPI()

# Mount static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Sample structure for items
items = {
    "test": [
        "test2",
    ],
    "test2": [ "test", "test43"],
}

@app.get("/", response_class=HTMLResponse)
async def get_graph():
    # Convert items to JSON string
    items_json = json.dumps(items)

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>App Dependencies</title>
        <!-- Vis.js CSS -->
        <link href="https://unpkg.com/vis-network@7.6.4/dist/vis-network.min.css" rel="stylesheet" type="text/css" />
        <!-- Include the renderGraph.js script -->
        <script src="/static/renderGraph.js"></script>
    </head>
    <body>
        <select id="appSelect">
            <option value="" selected="chappie">Select an App</option>
            {''.join(f'<option value="{app}">{app}</option>' for app in items.keys())}
        </select>

        <div id="mynetwork" style="width: 1000px; height: 800px; border: 1px solid lightgray;"></div>

        <!-- Vis.js Library -->
        <script type="text/javascript" src="https://unpkg.com/vis-network@7.6.4/dist/vis-network.min.js"></script>

        <!-- Initialize items variable -->
        <script type="text/javascript">
            var items = {items_json};
        </script>
        <div id="legend"></div>
    </body>
    </html>
    """


@app.get("/{app}", response_class=HTMLResponse)
async def get_app(app: str):
    items_json = json.dumps(items)
    if app not in items:
        return "App not found", 404

    # <div id="networkContainer" style="position: relative; width: 1000px; height: 800px; border: 1px solid lightgray;">
    #         <div id="legend" style="position: absolute; top: 10px; right: 10px; background-color: white; padding: 10px; border-radius: 5px; border: 1px solid #ccc;"></div>
    #         <div id="mynetwork" style="width: 100%; height: 100%;"></div>

    #     </div>
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{app} Dependencies</title>
        <link href="https://unpkg.com/vis-network@7.6.4/dist/vis-network.min.css" rel="stylesheet" type="text/css" />
        <script src="/static/renderGraph.js"></script>
        <link href="/static/style.css" rel="stylesheet" type="text/css" />
    </head>
     <body>
        <h1>{app} Dependencies</h1>


        <div id="bubbleGraph" style="width: 100%; height: 100%; float: left; border: 1px solid lightgray;"></div>
        <div id="controlFlowGraph" style="width: 100%; height: 0%; float: right; border: 1px solid lightgray;"></div>
        <div id="bubbleLegend" style="clear: both;"></div>

        <!-- Vis.js Library -->
        <script type="text/javascript" src="https://unpkg.com/vis-network@7.6.4/dist/vis-network.min.js"></script>

        <!-- Initialize items variable -->
        <script type="text/javascript">
            var items = {items_json};
        </script>

        <div id="legend"></div>
    </body>
    </html>
    """
