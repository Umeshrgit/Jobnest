import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
 
import  Home  from './components/Home';
import Default from './components/Default';
import Register from './components/Register';
import Employee from './components/Employee';
import Creator from './components/Creator'; 
import Dashboard from './components/Dashboard';
import Unauthorized from './components/Unauthorized';
import MyApplications from './components/MyApplications'; 
import  Jobs  from './components/Jobs'
import ForgotPassword from './components/ForgotPassword';
import   Login from './components/Login'; 
import MyMessages from './components/MyMessages';
const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Default/> } />
          <Route path="Login" element={<Login/> } />
          <Route path="/Home" element={<Home/> } /> 
          <Route path="/Register" element={<Register/> } />   
          <Route path="/Employee" element={<Employee/> } />  
          <Route path="/Creator" element={<Creator/>}  /> 
          <Route path="/Dashboard" element={<Dashboard/>}  /> 
          <Route path="/Unauthorized" element={<Unauthorized/>}/>
          <Route path="/myapplications" element={<MyApplications/>} />
            
          <Route path="/Jobs" element={<Jobs/> } />   
          <Route path="/ForgotPassword"  element={<ForgotPassword/>} /> 
          <Route path="/messages" element={<MyMessages/> } />

        </Routes>
      </div>
    </Router>
  );
};

export default App;