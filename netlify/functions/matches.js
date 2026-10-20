
exports.handler = async function (event) {
  const token =
    process.env.FOOTBALL_DATA_TOKEN ||
    process.env.FOOTBALL_DATA_API_KEY;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "API-Token fehlt in den Netlify Environment Variables."
      })
    };
  }

  const id = event.queryStringParameters?.id;
  const today = new Date().toISOString().slice(0, 10);

  const endpoint = id
    ? `https://api.football-data.org/v4/matches/${encodeURIComponent(id)}`
    : `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        "X-Auth-Token": token
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          message: data.message || "Fehler bei football-data.org"
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify(
        id ? data : { matches: data.matches || [] }
      )
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        message: "Die Fußball-API ist momentan nicht erreichbar."
      })
    };
  }
};
