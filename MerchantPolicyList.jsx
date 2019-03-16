import React from "react";
import * as merchantPolicyService from "../../services/merchantPolicyService";
import { CardHeader, Card, CardBody, CardFooter, Modal } from "reactstrap";
import MerchantPolicyPost from "./MerchantPolicyPost";
import MerchantPolicyUpdate from "./MerchantPolicyUpdate";
import SweetAlertWarning from "../ui/SweetAlertWarning";
import OnAlert from "../ui/OnAlert";
import PropTypes from "prop-types";

export default class MerchantPolicyList extends React.Component {
  state = {
    policies: [],
    editingPolicy: null,
    showModal: false,
    showEdit: false,
    confirmDelete: false,
    deleteId: "",
    showSuccessAlert: false,
    showErrorAlert: false
  };

  componentDidMount() {
    console.log("component did mount ran");
    this.loadPage();
  }

  loadPage = () => {
    merchantPolicyService
      .getAll()
      .then(this.onGetAllSuccess)
      .catch(this.onGetAllError);
  };

  onGetAllSuccess = data => {
    this.setState({ policies: data.items });
  };

  onGetAllError = error => {
    console.log(`Axios failed to load page`, error);
  };

  openModal = () => {
    this.setState({
      showModal: true
    });
    this.onDismissErrorAlert();
    this.onDismissSuccessAlert();
  };

  closeModal = () => {
    this.setState({
      showModal: false
    });
  };

  showEdit = () => {
    this.setState({
      showEdit: true
    });
  };

  closeEdit = () => {
    this.setState({
      showEdit: false
    });
  };

  confirmDelete = () => {
    const policyIdToDelete = this.state.deleteId;

    merchantPolicyService
      .deleteById(policyIdToDelete)
      .then(this.deleteSuccess(policyIdToDelete))
      .then(this.setState({ confirmDelete: false }))
      .catch(this.deleteError);
  };

  deleteSuccess = policyIdToDelete => {
    const arr = this.state.policies.filter(
      policy => policy.id !== policyIdToDelete
    );

    this.setState({
      policies: arr
    });
    console.log("delete Success");
  };

  deleteError = error => {
    console.log("delete error", error);
  };

  onEditClick = policy => {
    this.setState(
      {
        editingPolicy: policy
      },
      () => {
        this.setState({
          showEdit: true
        });
        this.onDismissErrorAlert();
        this.onDismissSuccessAlert();
      }
    );
  };

  updateArray = policypar => {
    const policyIdToBeUpdated = policypar.id;
    const policies = this.state.policies.map(policy =>
      policy.id === policyIdToBeUpdated ? policypar : policy
    );

    this.setState(
      {
        policies
      },
      () => {
        console.log(
          "This is the list of updated policies ",
          this.state.policies
        );
      }
    );
  };

  handleNewArray = policy => {
    this.setState(previousState => ({
      policies: [...previousState.policies, policy]
    }));
  };

  renderPoliciesMap() {
    return this.state.policies.map(policy => (
      <Card style={{ width: "100%", overflow: "auto" }} key={policy.id}>
        <Card>
          <CardHeader
            tag="h4"
            style={{ background: "rgba(0,0,0,0.03)", textAlign: "center" }}
          >
            <h3 className="font-normal">{policy.title}</h3>
          </CardHeader>
          <CardBody className="card-body">
            <span className="m-b-0 m-t-10">{policy.description}</span>
          </CardBody>
          {this.props.currentRoles.includes("Admin") ? (
       <CardFooter style={{ background: "rbga(0,0,0,0)" }}>
       <div className="">
         <div className="row">
           <div className="col-2">
             <i
               className="ti-pencil-alt"
               onClick={() => {
                 this.onEditClick(policy);
               }}
             />
           </div>
           <div className="col-8" />
           <div className="col-2">
             <i
               className="icon-close"
               onClick={() => {
                 this.onDelete(policy.id);
               }}
             />
           </div>
         </div>
       </div>
     </CardFooter>
          ) : (
            <div />
          )}
        </Card>
      </Card>
    ));
  }

  onDelete = id => {
    this.setState({ confirmDelete: true, deleteId: id });
  };

  cancelDelete = () => {
    this.setState({ confirmDelete: false });
  };

  ratingsTruthiness = () => {
    if (this.state.ratings && this.state.ratings.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  openSuccessAlert = () => {
    this.setState({ showSuccessAlert: true });
  };

  openErrorAlert = () => {
    this.setState({ showErrorAlert: true });
  };

  onDismissSuccessAlert = () => {
    this.setState({ showSuccessAlert: false });
  };

  onDismissErrorAlert = () => {
    this.setState({ showErrorAlert: false });
  };

  render() {
    return (
      <div>
        {this.props.currentRoles.includes("Admin")&& 
        <button
        className="btn btn-success waves-effect"
        onClick={this.openModal}
        >
          Add A New Merchant Policy
        </button>
        }
        {this.state.showSuccessAlert ? (
          <OnAlert
            color="success"
            alertBox="alertBox"
            fontColor="text-success"
            icon="fab fa-grav"
            alertIcon="alertIcon"
            title="Success"
            message="You have successfully submitted your request"
          />
        ) : null}
        {this.state.showErrorAlert ? (
          <OnAlert
            color="danger"
            alertBox="alertBox"
            fontColor="text-danger"
            icon="mdi mdi-alert-circle"
            alertIcon="alertIcon"
            title="Error!"
            message="There has been an error completing your request"
          />
        ) : null}
        {this.state.confirmDelete && (
          <SweetAlertWarning
            confirmAction={this.confirmDelete}
            cancelAction={this.cancelDelete}
            type="warning"
            confirmBtnText="Yes, delete it!"
            confirmBtnStyle="danger"
            cancelBtnText="Cancel"
            cancelBtnStyle="default"
            title="Are you sure?"
            message="You will not be able to recover this information!"
          />
        )}
        <Modal isOpen={this.state.showModal}>
          <MerchantPolicyPost
            onDismissErrorAlert={this.onDismissErrorAlert}
            onDismissSuccessAlert={this.onDismissSuccessAlert}
            openSuccessAlert={this.openSuccessAlert}
            openErrorAlert={this.openErrorAlert}
            closeModal={this.closeModal}
            handleNewArray={this.handleNewArray}
          />
        </Modal>
        <Modal isOpen={this.state.showEdit}>
          <MerchantPolicyUpdate
            onDismissErrorAlert={this.onDismissErrorAlert}
            onDismissSuccessAlert={this.onDismissSuccessAlert}
            openSuccessAlert={this.openSuccessAlert}
            openErrorAlert={this.openErrorAlert}
            key={this.state.editingProlicy ? this.state.editingPolicy.id : ""}
            policy={this.state.editingPolicy}
            closeEdit={this.closeEdit}
            updateArray={this.updateArray}
          />
        </Modal>
        <div className="row">{this.renderPoliciesMap()}</div>
      </div>
    );
  }
}

MerchantPolicyList.propTypes = {
  currentRoles: PropTypes.array
};
