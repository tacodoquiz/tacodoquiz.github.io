import React from 'react';

class TRadio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.item
    }

    this.handleChange = this.handleChange.bind(this);
    this.enableSubmit = props.enableSubmit;
  }

  handleChange(event) {
    let obj = this.state.item;
    obj.answer = event.target.value;
    this.setState({item: obj});
    this.enableSubmit();
  }

  render() {
    let item = this.state.item;
    return (
      <div>
        <h4 class="mb-3">{item.question}</h4>
        <div class="d-block my-3">
        {
          item.options.map((a, i) => {
            return (
              <div class="form-check">
                <input class="form-check-input" type="radio" name={item.id} id={item.id + i} value={a} onClick={this.handleChange} />
                <label class="form-check-label" for={item.id + i}>{a}</label>
              </div>
            )
          })
        }
        </div>
        <hr class="mb-4" />
      </div>
    )
  }
}

class TCheck extends React.Component {
  constructor(props) {
    super(props);
    let arrOpt = {};
    props.item.options.forEach(opt => {arrOpt[opt] = false;});
    this.state = {
      item: props.item,
      options: arrOpt
    }

    this.handleChange = this.handleChange.bind(this);
    this.enableSubmit = props.enableSubmit;
  }

  handleChange(event) {
    let arrOpt = this.state.options;
    for(let opt in arrOpt) {
       if (event.target.value === opt) {
          arrOpt[opt] = event.target.checked;
       }
    }
    this.setState({options: arrOpt})

    let arrValue = [];
    for(let opt in arrOpt) {
      if (arrOpt[opt]) {
        arrValue.push(opt);
      }
    }

    let obj = this.state.item;
    if (arrValue.length) {
      obj.answer = arrValue.join(',');
    } else {
      obj.answer = null;
    }
    this.setState({item: obj})
    this.enableSubmit()
  }

  render() {
    let item = this.state.item;
    return (
      <div>
        <h4 class="mb-3">{item.question}</h4>
        <div class="d-block my-3">
        {
          item.options.map((a, i) => {
            return (
              <div class="form-check">
                <input class="form-check-input" type="checkbox" name={item.id} id={item.id + i} value={a} onClick={this.handleChange} />
                <label class="form-check-label" for={item.id + i}>{a}</label>
              </div>
            )
          })
        }
        </div>
        <hr class="mb-4" />
      </div>
    )
  }
}

class TText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.item
    }

    this.handleChange = this.handleChange.bind(this);
    this.enableSubmit = props.enableSubmit;
  }

  handleChange(event) {
    let obj = this.state.item;
    obj.answer = event.target.value;
    this.setState({item: obj});
    this.enableSubmit();
  }

  render() {
    return (
      <div>
        <h4 class="mb-3">{this.state.item.question}</h4>
        <div class="d-block my-3">
          <div class="form-group">
            <input type="text" class="form-control" id={this.state.item.id} onChange={this.handleChange} />
          </div>
        </div>
        <hr class="mb-4" />
      </div>
    )
  }
}

class TList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      action: props.uri,
      items: props.items,
      token: props.token,
      allowSubmit: false,
      submitLabel: 'Send',
      arrType: {
        "radio": TRadio,
        "checkbox": TCheck,
        "text": TText
      }
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.enableSubmit = this.enableSubmit.bind(this);
  }

  enableSubmit() {
    // console.log(this.state.items)
    for(let i in this.state.items)
      if(!this.state.items[i].answer)
        return this.setState({allowSubmit: false});

    this.setState({allowSubmit: true});
  }

  handleSubmit(event) {
    event.preventDefault();
    let data = { token: this.state.token, answers: {} };
    this.state.items.forEach(item => {
      data.answers[item.id] = item.answer;
    });
    this.setState({allowSubmit: false, submitLabel: 'Sending...'});
    fetch(this.state.action, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(json => {
      window.location.href = '/score.html';
    });
  }

  render() {
    return (
      <div class="row">
        <div class="col-md-8 mx-auto">
          <form>{ this.state.items.map((item, i) => {
              let TType = this.state.arrType[item.type]
              return <TType item={item} enableSubmit={this.enableSubmit} />
            }) }
          <div class="form-group row">
            <div class="col-sm-2"></div>
            <div class="col-sm-6">
              <button class="btn btn-warning btn-block" disabled={!this.state.allowSubmit} onClick={this.handleSubmit}>{this.state.submitLabel}</button>
            </div>
          </div>
          </form>
        </div>
      </div>
    )
  }
}
export default TList