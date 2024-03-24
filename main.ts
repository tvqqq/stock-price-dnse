import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
    const currentUrl = new URL(req.url);
    const ticket = currentUrl.searchParams.get('ticket')

    let date = new Date();
    let lastPrice = null;
    let count = 0;

    do {
        date.setDate(date.getDate() - count);
        const today = date.toJSON().slice(0, 10);
        console.log('today', today);

        const body = {
            "operationName": "GetTicksBySymbol",
            "query": `query GetTicksBySymbol {GetTicksBySymbol(symbol: \"${ticket}\", date: \"${today}\", limit: 1) {data {symbol matchPrice matchQtty time}}}`
        }

        const dnse = await fetch("https://services.entrade.com.vn/price-api/query", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(body)
        });
        const dnseJson = await dnse.json();
        if (dnseJson.data.GetTicksBySymbol.data.length > 0) {
            lastPrice = dnseJson.data.GetTicksBySymbol.data[0].matchPrice * 1000
        }
        console.log('lastPrice', lastPrice);
        count++;
    } while (!lastPrice)

    const result = {
        data: {
            LastPrice: lastPrice
        }
    }
    console.log('DONE');

    return Response.json(result);
});
