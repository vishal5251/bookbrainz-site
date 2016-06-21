const React = require('react');
const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;

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
				<div className="form-group">
					<div className="col-md-4 col-md-offset-4">
						<Button
							block
							bsSize="large"
							bsStyle="primary"
							type="submit"
						>
							Update!
						</Button>
					</div>
				</div>
			</form>
		);
		
	}
})
