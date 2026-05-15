import zipfile
import os
import shutil

def setup_dataset(zip_path, extract_to='dataset'):
    """
    Extracts the dataset and organizes it.
    """
    if not os.path.exists(zip_path):
        print(f"Zip file {zip_path} not found.")
        return

    print(f"Extracting {zip_path}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    
    print("Dataset extracted and ready.")

if __name__ == "__main__":
    # Example usage
    # setup_dataset('fingernail_dataset.zip')
    pass
