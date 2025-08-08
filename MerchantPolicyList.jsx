import React, { useState, useEffect, useCallback } from "react";
import * as merchantPolicyService from "../../services/merchantPolicyService";
import { CardHeader, Card, CardBody, CardFooter, Modal } from "reactstrap";
import MerchantPolicyPost from "./MerchantPolicyPost";
import MerchantPolicyUpdate from "./MerchantPolicyUpdate";
import SweetAlertWarning from "../ui/SweetAlertWarning";
import OnAlert from "../ui/OnAlert";
import PropTypes from "prop-types";

const MerchantPolicyList = ({ currentRoles }) => {
  const [policies, setPolicies] = useState([]);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const loadPage = useCallback(async () => {
    try {
      const data = await merchantPolicyService.getAll();
      setPolicies(data.items);
    } catch (error) {
      console.error("Failed to load policies:", error);
      setShowErrorAlert(true);
    }
  }, []);

  useEffect(() => {
    console.log("Component mounted");
    loadPage();
  }, [loadPage]);

  const openModal = () => {
    setShowModal(true);
    setShowErrorAlert(false);
    setShowSuccessAlert(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const showEditModal = () => {
    setShowEdit(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
  };

  const confirmDeletePolicy = async () => {
    try {
      await merchantPolicyService.deleteById(deleteId);
      setPolicies(prevPolicies => 
        prevPolicies.filter(policy => policy.id !== deleteId)
      );
      setConfirmDelete(false);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Delete error:", error);
      setShowErrorAlert(true);
    }
  };

  const onEditClick = (policy) => {
    setEditingPolicy(policy);
    setShowEdit(true);
    setShowErrorAlert(false);
    setShowSuccessAlert(false);
  };

  const updateArray = (updatedPolicy) => {
    setPolicies(prevPolicies => 
      prevPolicies.map(policy =>
        policy.id === updatedPolicy.id ? updatedPolicy : policy
      )
    );
    console.log("Updated policies:", policies);
  };

  const handleNewArray = (policy) => {
    setPolicies(prevPolicies => [...prevPolicies, policy]);
  };

  const onDelete = (id) => {
    setConfirmDelete(true);
    setDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
  };

  const openSuccessAlert = () => {
    setShowSuccessAlert(true);
  };

  const openErrorAlert = () => {
    setShowErrorAlert(true);
  };

  const onDismissSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  const onDismissErrorAlert = () => {
    setShowErrorAlert(false);
  };

  const renderPoliciesMap = () => {
    return policies.map(policy => (
      <Card 
        key={policy.id} 
        className="mb-3 shadow-sm"
        style={{ width: "100%" }}
      >
        <CardHeader
          tag="h4"
          className="bg-light text-center border-0"
        >
          <h3 className="font-weight-normal mb-0">{policy.title}</h3>
        </CardHeader>
        <CardBody className="p-3">
          <p className="mb-0">{policy.description}</p>
        </CardBody>
        {currentRoles.includes("Admin") && (
          <CardFooter className="bg-transparent border-0 p-2">
            <div className="d-flex justify-content-between align-items-center">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => onEditClick(policy)}
                title="Edit"
              >
                <i className="fas fa-edit" />
              </button>
              <div className="flex-grow-1" />
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => onDelete(policy.id)}
                title="Delete"
              >
                <i className="fas fa-trash" />
              </button>
            </div>
          </CardFooter>
        )}
      </Card>
    ));
  };

  return (
    <div className="container-fluid">
      {currentRoles.includes("Admin") && (
        <button
          className="btn btn-success mb-3"
          onClick={openModal}
        >
          <i className="fas fa-plus me-2" />
          Add A New Merchant Policy
        </button>
      )}
      
      {showSuccessAlert && (
        <OnAlert
          color="success"
          alertBox="alertBox"
          fontColor="text-success"
          icon="fas fa-check-circle"
          alertIcon="alertIcon"
          title="Success"
          message="You have successfully submitted your request"
        />
      )}
      
      {showErrorAlert && (
        <OnAlert
          color="danger"
          alertBox="alertBox"
          fontColor="text-danger"
          icon="fas fa-exclamation-triangle"
          alertIcon="alertIcon"
          title="Error!"
          message="There has been an error completing your request"
        />
      )}
      
      {confirmDelete && (
        <SweetAlertWarning
          confirmAction={confirmDeletePolicy}
          cancelAction={cancelDelete}
          type="warning"
          confirmBtnText="Yes, delete it!"
          confirmBtnStyle="danger"
          cancelBtnText="Cancel"
          cancelBtnStyle="default"
          title="Are you sure?"
          message="You will not be able to recover this information!"
        />
      )}
      
      <Modal isOpen={showModal} toggle={closeModal}>
        <MerchantPolicyPost
          onDismissErrorAlert={onDismissErrorAlert}
          onDismissSuccessAlert={onDismissSuccessAlert}
          openSuccessAlert={openSuccessAlert}
          openErrorAlert={openErrorAlert}
          closeModal={closeModal}
          handleNewArray={handleNewArray}
        />
      </Modal>
      
      <Modal isOpen={showEdit} toggle={closeEdit}>
        <MerchantPolicyUpdate
          onDismissErrorAlert={onDismissErrorAlert}
          onDismissSuccessAlert={onDismissSuccessAlert}
          openSuccessAlert={openSuccessAlert}
          openErrorAlert={openErrorAlert}
          key={editingPolicy ? editingPolicy.id : ""}
          policy={editingPolicy}
          closeEdit={closeEdit}
          updateArray={updateArray}
        />
      </Modal>
      
      <div className="row g-3">
        {renderPoliciesMap()}
      </div>
    </div>
  );
};

MerchantPolicyList.propTypes = {
  currentRoles: PropTypes.array.isRequired
};

export default MerchantPolicyList;
