import React, { useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import DashboardAction from './DashboardActions';
import Experience from './Experience';
import Education from './Education';
import { getCurrentProfile } from '../../actions/profile';
import { Link } from 'react-router-dom';

const Dashboard = ({
	getCurrentProfile,
	auth: { user },
	profile: { profile, loading }
}) => {
	useEffect(() => {
		// eslint-disable-next-line
		getCurrentProfile();
	}, [getCurrentProfile]);
	return loading && profile === null ? (
		<Spinner />
	) : (
		<Fragment>
			<h1>Dashboard</h1>
			<p>
				<i className='fas fa-user' /> Welcome {user && user.name}
			</p>
			{profile !== null ? (
				<Fragment>
					<DashboardAction />
					<Experience experience={profile.experience} />
					<Education education={profile.education} />
				</Fragment>
			) : (
				<Fragment>
					<p>Have not setup profile</p>
					<Link to='/create-profile' className='btn btn-primary my-1'>
						{' '}
						Create Profile
					</Link>
				</Fragment>
			)}
		</Fragment>
	);
};

Dashboard.propTypes = {
	getCurrentProfile: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
	profile: PropTypes.object.isRequired
};

const mapStateToProp = (state) => ({
	auth: state.auth,
	profile: state.profile
});

export default connect(mapStateToProp, { getCurrentProfile })(Dashboard);
