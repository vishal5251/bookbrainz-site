const React = require('react');
const Input = require('react-bootstrap').Input;

module.exports = React.createClass({
	displayName: 'AchievementAdminForm',
	render() {
		'use strict';
		
		return (
			<form
				className="form-horizontal"
			>
				<Input
					label="Editor"
					labelClassName="col-md-3"
					ref={(ref) => this.editor = ref}
					type="textarea"
					wrapperClassName="col-md-9"
					/>
				<Input
					label="Achievement"
					labelClassName="col-md-3"
					ref={(ref) => this.achievement = ref}
					type="textarea"
					wrapperClassName="col-md-9"
					/>
				<Input
					label="Title"
					labelClassName="col-md-3"
					ref={(ref) => this.title = ref}
					type="textarea"
					wrapperClassName="col-md-9"
					/>
			</form>
		);
		
	}
})
