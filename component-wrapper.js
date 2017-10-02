class COMPONENT_NAME extends React.Component {
  render() {
    const keepWebSimpleProperties = this.props;
    return renderComponent(Object.assign({}, keepWebSimpleProperties, {
      content: keepWebSimpleProperties.children,
    }));
  }
}
