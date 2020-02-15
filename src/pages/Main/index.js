import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import { Form, SubmitButton, List, ErrorMessage } from './styles';
import Container from '../../components/container';

// import { Container } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
    errorMsg: '',
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    let { error } = this.state;
    error = e.target.value !== '' && error;
    this.setState({ newRepo: e.target.value, error });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true, error: false });
    try {
      const { newRepo, repositories } = this.state;

      if (repositories.find(repo => repo.name === newRepo)) {
        throw new Error('Repositório duplicado');
      }

      const response = await api.get(`/repos/${newRepo}`).catch(err => {
        if (err.response.status === 404) {
          throw new Error('Repositório não encontrado');
        } else {
          throw new Error(err);
        }
      });

      const data = {
        name: response.data.full_name,
      };
      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
      });
    } catch (err) {
      this.setState({ error: true, errorMsg: err.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { newRepo, loading, repositories, error, errorMsg } = this.state;
    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>
        <ErrorMessage show={error}>{errorMsg}</ErrorMessage>
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
