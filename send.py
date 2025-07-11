import http.client
import json

conn = http.client.HTTPSConnection("wgw3kq.api.infobip.com")
payload = json.dumps({
    "messages": [
        {
            "destinations": [{"to":"916289652321"}],
            "from": "447491163443",
            "text": "Congratulations on sending your first message. Go ahead and check the delivery report in the next step."
        }
    ]
})
headers = {
    'Authorization': 'App ab91e7dd2573099b5b44d04ba117d29f-7de30413-0b5a-4516-bcbe-f534ae18eb0d',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}
conn.request("POST", "/sms/2/text/advanced", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))