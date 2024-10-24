import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState} from 'react';
import { Link } from 'react-router-dom';

const Profile_component = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [current_balance, setCurrentBalance] = useState(0);
    const [monthly_budget, setMonthlyBudget] = useState(0);
    const [name_error, setNameError] = useState("");

    useEffect(() => {
        fetch('http://localhost:5000/profile', {
            method: 'GET',
            credentials: 'include', // Important to send cookies with the request
        }).then((response) => response.json()).then((data) => {
            if (data.profile) {
                setProfile(data.profile);
            }
            else if (data.message) {
                setError(data.message);
            }
        }).catch((err) => {
            setError("Error fetching profile.");

        });
    }, []);
    const handleNameChange = (setter) => (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Z]*$/; // Only alphabetic characters
        if (regex.test(value)) {
            const capatilized_value = value.charAt(0).toUpperCase() + value.slice(1); //create and force the input box to have new capatilized value
            setter(capatilized_value);
            setNameError("");
        }
        else {
            setNameError("Names can only contain alphabet characters.");
        }
    };
    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        //Onboarding data to be sent to backend.
        const onboarding_data = {
            first_name: first_name,
            last_name: last_name,
            balances: {
                amount: current_balance,
            },
            budget: {
                amount: monthly_budget
            }
        };
        try {//Let's try to send the data
            const response = await fetch('http://localhost:5000/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Send cookies with the request
                body: JSON.stringify(onboarding_data),
            });
            if (response.ok) {
                //Response is good and has been sent; refresh the profile.
                setProfile(onboarding_data);
            }
            else {
                //Error has appeared.
                setError("Error updating profile.");
            }
    }
    catch (error) {
        setError("Error submitting onboarding data.");
    }
};
return (
    <div className="container-fluid">
            {/*This page will be based on conditions. If an error is present, the error will display. If there is no first name, the onboarding page will display. Otherwise the profile will display.*/}
            {error && 
                <p className="text-danger">{error}</p>}
            {profile ? (//No error; profile data is present.
             profile.first_name ? (//Profile has first name; display the profile.
                    <div className="row">
                        {/* Left navigation */}
                        <nav className="col-md-2 bg-light sidebar">
                        <div className="position-sticky">
                        <ul className="nav flex-column">
                        <li className="nav-item">
                            <Link to="/add-expense" className="nav-link">Add Expense</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/add-balance" className="nav-link">Add or Update Balance</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/goals" className="nav-link">View or Add Goals</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/update-profile" className="nav-link">Update Profile</Link>
                        </li>
                        </ul>
                        </div>
                        </nav>
                        {/* Main content */}
                        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                        <header className="d-flex justify-content-between align-items-center py-3 mb-4 border-bottom">
                            <div>
                            <h1>Welcome, {profile.first_name}!</h1>
                            {profile.balances.map((balance) => (
                                <h2>{balance.balance_type}: ${balance.amount}</h2>
                            ))}
                            <h2>Monthly budget: ${profile.budget.amount}</h2>
                            </div>
                            <button className="btn btn-outline-danger">Logout</button>
                        </header>
                        {/* Expenses table or empty state */}
                        <section>
                            {profile.expenses.length === 0 ? (//No expenses; show empty state.
                            <p>Oh dear, no transactions to show. Click the "add Expense or Update Balance" button to get started.</p>
                            ) : (//Transactions exists; show table.
                                <table className="table">
                                <thead>
                                <tr>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {profile.expenses.map((expense, index) => (
                                    <tr key={index}>
                                    <td>{expense.category}</td>
                                    <td>{expense.description}</td>
                                    <td>${expense.amount}</td>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    </tr>
                                    ))}
                                    </tbody>
                                    </table>
                            )}
                        </section>
                        </main>
                    </div>
             ) : ( //First name not present. Onboarding is below.
                <main className="mt-5">
                    <h1>Welcome! Let's get started with your profile so you can start saving big.</h1>
                    <form className="bg-light p-4 rounded shadow" onSubmit={handleOnboardingSubmit}>
                    <div className="mb-3">
                        <label htmlFor="first-name" className="form-label">First Name</label>
                        <input
                        type="text"
                        id="first-name"
                        className='form-control'
                        value={first_name}
                        onChange={handleNameChange(setFirstName)}
                        required
                        autoFocus
                        />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='last-name' className='form-label'>Last Name</label>
                        <input
                        type="text"
                        id="last-name"
                        className='form-control'
                        value={last_name}
                        onChange={handleNameChange(setLastName)}
                        required
                        />
                        {name_error && <p className="text-danger" role="alert">{name_error}</p>}
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='current-balance' className='form-label'>What is your current balance? This balance should be your overall assets or overall balance.</label>
                        <input
                        type="number"
                        id="current-balance"
                        className='form-control'
                        value={current_balance}
                        onChange={(e) => setCurrentBalance(e.target.value)}
                        required
                        />
                        
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='monthly-budget' className='form-label'>What will be your budget for this month?</label>
                        <input
                        type="number"
                        id='monthly-budget'
                        className='form-control'
                        value={monthly_budget}
                        onChange={(e) => setMonthlyBudget(e.target.value)}
                        required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Update Profile</button>
                    </form>
                </main>
             )
                ) : (//First name is present.
                    <p>Loading profile...</p>
            )}
                    </div>
        
    );
};

export default Profile_component;
