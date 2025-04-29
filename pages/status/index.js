import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  let updatedAtText = "Carregando...";
  let dbVersion = "Carregando...";
  let dbMaxConnections = "Carregando...";
  let dbOpennedConnections = "Carregando...";

  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
    dbVersion = data.dependencies.database.version;
    dbMaxConnections = data.dependencies.database.max_connections;
    dbOpennedConnections = data.dependencies.database.openned_connections;
  }
  return (
    <>
      <h1>Status</h1>
      <StatusItem title="Última Atualização" value={updatedAtText} />
      <h1>Database</h1>
      <StatusItem title="Versão do Postgres" value={dbVersion} />
      <StatusItem title="Máximo de Conexões" value={dbMaxConnections} />
      <StatusItem title="Conexões Abertas" value={dbOpennedConnections} />
    </>
  );
}

function StatusItem({ title, value }) {
  return (
    <div>
      {title}: {value}
    </div>
  );
}
