const React = require('react');
const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;
const Select = require('../input/select2.jsx');
const request = require('superagent-bluebird-promise');

module.exports = React.createClass({
	displayName: 'AchievementAdminForm',
	handleSubmit(event) {
		'use strict';
		event.preventDefault();
		const data = {
			editor: this.editor.getValue(),
			achievement: this.achievement.getValue(),
			title: this.title.getValue()
		};
		console.log(data);
		this.setState({waiting: true});

		request.post('/achievement/admin/handler')
			.send(data).promise()
			.then(() => {
				window.location.href = '/blah';
			});
	},
	render() {
		'use strict';

		return (
			<form
				className="form-horizontal"
				onSubmit={this.handleSubmit}
			>
				<Select
					noDefault
					idAttribute="id"
					label="Editor"
					labelAttribute="name"
					labelClassName="col-md-3"
					options={this.props.editor}
					palaceholder="Select Editor"
					ref={(ref) => this.editor = ref}
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
});
