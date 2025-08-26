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
  const [deleteId, setDeleteId] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await merchantPolicyService.getAll();
      setPolicies(data.items);
    } catch (error) {
      console.error("Failed to load policies:", error);
      setAlert({ show: true, type: 'error', message: 'Failed to load policies' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const openModal = () => {
    setShowModal(true);
    setAlert({ show: false, type: '', message: '' });
  };

  const closeModal = () => {
    setShowModal(false);
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
      setAlert({ show: true, type: 'success', message: 'Policy deleted successfully' });
    } catch (error) {
      console.error("Delete error:", error);
      setAlert({ show: true, type: 'error', message: 'Failed to delete policy' });
    }
  };

  const onEditClick = (policy) => {
    setEditingPolicy(policy);
    setShowEdit(true);
    setAlert({ show: false, type: '', message: '' });
  };

  const updateArray = (updatedPolicy) => {
    setPolicies(prevPolicies =>
      prevPolicies.map(policy =>
        policy.id === updatedPolicy.id ? updatedPolicy : policy
      )
    );
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

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
  };

  const dismissAlert = () => {
    setAlert({ show: false, type: '', message: '' });
  };

  const renderPoliciesMap = () => {
    return policies.map(policy => (
      <Card 
        key={policy.id} 
        className="mb-3 shadow-sm"
        style={{ width: "100%" }}
      >
        <CardHeader
          tag="header"
          className="bg-light text-center border-0"
        >
          <h3 className="font-weight-normal mb-0" id={`policy-title-${policy.id}`}>
            {policy.title}
          </h3>
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
                aria-label={`Edit ${policy.title} policy`}
                title="Edit policy"
              >
                <i className="fas fa-edit" aria-hidden="true" />
                <span className="sr-only">Edit</span>
              </button>
              <div className="flex-grow-1" />
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => onDelete(policy.id)}
                aria-label={`Delete ${policy.title} policy`}
                title="Delete policy"
              >
                <i className="fas fa-trash" aria-hidden="true" />
                <span className="sr-only">Delete</span>
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
          aria-label="Add a new merchant policy"
        >
          <i className="fas fa-plus me-2" aria-hidden="true" />
          Add A New Merchant Policy
        </button>
      )}
      
      {alert.show && (
        <OnAlert
          color={alert.type === 'success' ? 'success' : 'danger'}
          alertBox="alertBox"
          fontColor={alert.type === 'success' ? 'text-success' : 'text-danger'}
          icon={alert.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'}
          alertIcon="alertIcon"
          title={alert.type === 'success' ? 'Success' : 'Error!'}
          message={alert.message}
          onDismiss={dismissAlert}
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
      
      <Modal 
        isOpen={showModal} 
        toggle={closeModal}
        aria-labelledby="add-policy-modal-title"
        role="dialog"
      >
        <MerchantPolicyPost
          showAlert={showAlert}
          closeModal={closeModal}
          handleNewArray={handleNewArray}
        />
      </Modal>
      
      <Modal 
        isOpen={showEdit} 
        toggle={closeEdit}
        aria-labelledby="edit-policy-modal-title"
        role="dialog"
      >
        <MerchantPolicyUpdate
          showAlert={showAlert}
          key={editingPolicy ? editingPolicy.id : ""}
          policy={editingPolicy}
          closeEdit={closeEdit}
          updateArray={updateArray}
        />
      </Modal>
      
      <div 
        className="row g-3"
        role="region"
        aria-label="Merchant policies list"
      >
        {isLoading ? (
          <div className="col-12 text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2">Loading policies...</p>
          </div>
        ) : policies.length === 0 ? (
          <div className="col-12 text-center py-4">
            <p className="text-muted" role="status" aria-live="polite">
              No merchant policies available.
            </p>
          </div>
        ) : (
          renderPoliciesMap()
        )}
      </div>
    </div>
  );
};

MerchantPolicyList.propTypes = {
  currentRoles: PropTypes.array.isRequired
};

export default MerchantPolicyList;
