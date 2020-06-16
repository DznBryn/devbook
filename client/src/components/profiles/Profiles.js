import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import Spinner from '../layout/Spinner';
import { connect } from 'react-redux';
import { getProfiles } from '../../actions/profile';
import ProfileItem from './ProfileItem';

const Profiles = ({ getProfiles, profile: { profiles, loading } }) => {
	useEffect(() => {
		getProfiles();
	}, [getProfiles]);

	console.log(profiles.length);
	return (
		<Fragment>
			{loading ? (
				<Spinner />
			) : (
				<Fragment>
					<h1 className='large text-primary'> Developers</h1>
					<p className='lead'>
						<i className='fab fa-connectdevelop'>
							{' '}
							Browse and connect with developers
						</i>
					</p>
					<div className='profiles'>
						{profiles.length > 0 ? (
							profiles.map((profile) => (
								<ProfileItem key={profile._id} profile={profile} />
							))
						) : (
							<h4>No Profiles found...</h4>
						)}
					</div>
				</Fragment>
			)}
		</Fragment>
	);
};

Profiles.propTypes = {
	getProfiles: PropTypes.func.isRequired,
	profile: PropTypes.object.isRequired
};

const mapStateToprops = (state) => ({
	profile: state.profile
});

export default connect(mapStateToprops, { getProfiles })(Profiles);
