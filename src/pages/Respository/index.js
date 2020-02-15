import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { Loading, Owner, IssueList, IssueFilter, Pager } from './styles';
import Container from '../../components/container';

// import { Container } from './styles';

export default class Repository extends Component {
  actions = {
    next: async () => {
      const { page } = this.state;
      this.setState({ page: page + 1 });
    },
    previous: async () => {
      const { page } = this.state;
      let newPage = page - 1;
      if (newPage < 1) {
        newPage = 1;
      }
      this.setState({ page: newPage });
    },
  };

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filterList: [
      { state: 'all', label: 'Todas', active: true },
      { state: 'open', label: 'Abertas', active: false },
      { state: 'closed', label: 'Fechadas', active: false },
    ],
    filterIndex: 0,
    page: 1,
    perPage: 5,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filterList, filterIndex, page, perPage } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filterList[filterIndex].state,
          per_page: perPage,
          page,
        },
      }),
    ]);
    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadIssues = async () => {
    const { match } = this.props;
    const { filterList, filterIndex, page, perPage } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filterList[filterIndex].state,
        per_page: perPage,
        page,
      },
    });

    this.setState({ issues: response.data });
  };

  handleFilterClick = async filterIndex => {
    await this.setState({ filterIndex });
    this.loadIssues();
  };

  handlePagerClick = async action => {
    const act = this.actions[action];
    await act();
    this.loadIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filterList,
      filterIndex,
      page,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <IssueFilter active={filterIndex}>
            {filterList.map((filter, index) => (
              <button
                type="button"
                key={filter.label}
                onClick={() => this.handleFilterClick(index)}
              >
                {filter.label}
              </button>
            ))}
          </IssueFilter>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pager>
          <button
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePagerClick('previous')}
          >
            Anterior
          </button>
          <span>Página {page}</span>
          <button
            type="button"
            onClick={() => this.handlePagerClick('next')}
            disabled={issues.length === 0}
          >
            Próximo
          </button>
        </Pager>
      </Container>
    );
  }
}
