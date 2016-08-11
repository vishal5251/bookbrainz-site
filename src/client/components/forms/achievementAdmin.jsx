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
			editor: this.editor.getValue()
		};

		const achievement = this.achievement.getValue();
		if (achievement !== '') {
			data.achievement = achievement;
		}
		const title = this.title.getValue();
		if (title !== '') {
			data.title = title;
		}
		this.setState({waiting: true});

		request.post('/achievement/admin/handler')
			.send(data).promise()
			.then(() => {
				window.location.href = '/achievement/admin';
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
				<Select
					idAttribute="name"
					label="Achievement"
					labelAttribute="name"
					labelClassName="col-md-3"
					options={this.props.achievement}
					placeholder="No Achievement"
					ref={(ref) => this.achievement = ref}
					wrapperClassName="col-md-9"
				/>
				<Select
					idAttribute="title"
					label="Title"
					labelAttribute="title"
					labelClassName="col-md-3"
					options={this.props.title}
					placeholder="No Title"
					ref={(ref) => this.title = ref}
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
