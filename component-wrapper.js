class COMPONENT_NAME extends React.Component {
  render() {
    const { props } = this;
    return renderComponent(Object.assign({}, props, {
      content: props.children,
    }));
  }
}
