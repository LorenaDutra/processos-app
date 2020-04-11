import React from 'react'
import { withRouter } from 'react-router-dom'

import Card from '../../components/card'
import FormGroup from '../../components/form-group'
import SelectMenu from '../../components/selectMenu'
import ProcessosTable from './processosTable'
import ProcessoService from '../../app/service/processoService'
import LocalStorageService from '../../app/service/localstorageService'

import * as messages from '../../components/toastr'

import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';



class ConsultaProcessos extends React.Component {

    state = {
        ano: '',
        mes: '',
        tipo: '',
        descricao: '',
        showConfirmDialog: false,
        processoDeletar: {},
        processos : []
    }

    constructor(){
        super();
        this.service = new ProcessoService();
    }

    buscar = () => {
        if(!this.state.ano){
            messages.mensagemErro('O preenchimento do campo Ano é obrigatório.')
            return false;
        }

        const usuarioLogado = LocalStorageService.obterItem('_usuario_logado');

        const processoFiltro = {
            ano: this.state.ano,
            mes: this.state.mes,
            tipo: this.state.tipo,
            descricao: this.state.descricao,
            usuario: usuarioLogado.id
        }

        this.service
            .consultar(processoFiltro)
            .then( resposta => {
                const lista = resposta.data;
                
                if(lista.length < 1){
                    messages.mensagemAlert("Nenhum resultado encontrado.");
                }
                this.setState({ processos: lista })
            }).catch( error => {
                console.log(error)
            })
    }

    editar = (id) => {
        this.props.history.push(`/cadastro-processos/${id}`)
    }

    abrirConfirmacao = (processo) => {
        this.setState({ showConfirmDialog : true, processoDeletar: processo  })
    }

    cancelarDelecao = () => {
        this.setState({ showConfirmDialog : false, processoDeletar: {}  })
    }

    deletar = () => {
        this.service
            .deletar(this.state.processoDeletar.id)
            .then(response => {
                const processos = this.state.processos;
                const index = processos.indexOf(this.state.processoDeletar)
                processos.splice(index, 1);
                this.setState( { processos: processos, showConfirmDialog: false } )
                messages.mensagemSucesso('Lançamento deletado com sucesso!')
            }).catch(error => {
                messages.mensagemErro('Ocorreu um erro ao tentar deletar o Lançamento')
            })
    }

    preparaFormularioCadastro = () => {
        this.props.history.push('/cadastro-processos')
    }

    alterarStatus = (processo, status) => {
        this.service
            .alterarStatus(processo.id, status)
            .then( response => {
                const processos = this.state.processos;
                const index = processos.indexOf(processo);
                if(index !== -1){
                    processo['status'] = status;
                    processos[index] = processo
                    this.setState({processo});
                }
                messages.mensagemSucesso("Status atualizado com sucesso!")
            })
    }

    render(){
        const meses = this.service.obterListaMeses();
        const tipos = this.service.obterListaTipos();

        const confirmDialogFooter = (
            <div>
                <Button label="Confirmar" icon="pi pi-check" onClick={this.deletar} />
                <Button label="Cancelar" icon="pi pi-times" onClick={this.cancelarDelecao} 
                        className="p-button-secondary" />
            </div>
        );

        return (
            <Card title="Consulta Lançamentos">
                <div className="row">
                    <div className="col-md-6">
                        <div className="bs-component">
                            <FormGroup htmlFor="inputAno" label="Ano: *">
                                <input type="text" 
                                       className="form-control" 
                                       id="inputAno" 
                                       value={this.state.ano}
                                       onChange={e => this.setState({ano: e.target.value})}
                                       placeholder="Digite o Ano" />
                            </FormGroup>

                            <FormGroup htmlFor="inputMes" label="Mês: ">
                                <SelectMenu id="inputMes" 
                                            value={this.state.mes}
                                            onChange={e => this.setState({ mes: e.target.value })}
                                            className="form-control" 
                                            lista={meses} />
                            </FormGroup>

                            <FormGroup htmlFor="inputDesc" label="Descrição: ">
                                <input type="text" 
                                       className="form-control" 
                                       id="inputDesc" 
                                       value={this.state.descricao}
                                       onChange={e => this.setState({descricao: e.target.value})}
                                       placeholder="Digite a descrição" />
                            </FormGroup>

                            <FormGroup htmlFor="inputTipo" label="Tipo Lançamento: ">
                                <SelectMenu id="inputTipo" 
                                            value={this.state.tipo}
                                            onChange={e => this.setState({ tipo: e.target.value })}
                                            className="form-control" 
                                            lista={tipos} />
                            </FormGroup>

                            <button onClick={this.buscar} 
                                    type="button" 
                                    className="btn btn-success">
                                    <i className="pi pi-search"></i> Buscar
                            </button>
                            <button onClick={this.preparaFormularioCadastro} 
                                    type="button" 
                                    className="btn btn-danger">
                                    <i className="pi pi-plus"></i> Cadastrar
                            </button>

                        </div>
                        
                    </div>
                </div>   
                <br/ >
                <div className="row">
                    <div className="col-md-12">
                        <div className="bs-component">
                            <ProcessosTable processos={this.state.processos} 
                                              deleteAction={this.abrirConfirmacao}
                                              editAction={this.editar}
                                              alterarStatus={this.alterarStatus} />
                        </div>
                    </div>  
                </div> 
                <div>
                    <Dialog header="Confirmação" 
                            visible={this.state.showConfirmDialog} 
                            style={{width: '50vw'}}
                            footer={confirmDialogFooter} 
                            modal={true} 
                            onHide={() => this.setState({showConfirmDialog: false})}>
                        Confirma a exclusão deste Lançamento?
                    </Dialog>
                </div>           
            </Card>

        )
    }
}

export default withRouter(ConsultaProcessos);