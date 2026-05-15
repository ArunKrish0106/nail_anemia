from sklearn.metrics import recall_score, precision_score, f1_score, cohen_kappa_score, matthews_corrcoef

def calculate_clinical_metrics(y_true, y_pred):
    return {
        "sensitivity": recall_score(y_true, y_pred),
        "specificity": recall_score(y_true, y_pred, pos_label=0),
        "precision": precision_score(y_true, y_pred),
        "f1": f1_score(y_true, y_pred),
        "mcc": matthews_corrcoef(y_true, y_pred),
        "kappa": cohen_kappa_score(y_true, y_pred)
    }
