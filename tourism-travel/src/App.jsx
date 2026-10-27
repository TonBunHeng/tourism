import AppRoutes from './routes/AppRoutes';
import tourism_logo from './assets/images/tourism_logo.png';

function App() {
  return (
    <>
      <link rel="icon" type="image/png" href={tourism_logo} />
      <AppRoutes />
    </>
  );
}

export default App;
