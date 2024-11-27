import './VendorAdmin.css';

const VendorAdmin = () => {
  return (
    <div className="vendor-admin-container">
      <h4>Vendor Admin</h4>
      <form>
        <div className="form-group">
          <label htmlFor="rfp-reference-no">RFP Reference No:</label>
          <select id="rfp-reference-no">
            <option value="">Select</option>
            {/* Add options dynamically */}
          </select>
        </div>

        <div className="reference-details">
          <p>&lt;RFP Reference No&gt; - &lt;RFP Title&gt;</p>
        </div>

        <div className="form-group">
          <label htmlFor="vendor">Vendor</label>
          
        </div>
        <div className="form-group">
          <label htmlFor="entity-name">Entity Name:</label>
          <input id="entity-name" type="text" />
        </div>

        <div className="form-group">
          <label htmlFor="vendor-sub-name">Entity Sub Name:</label>
          <input id="vendor-sub-name" type="text" />
        </div>

        <div className="form-group">
          <label htmlFor="vendor-landline">Entity Landline:</label>
          <input id="vendor-landline" type="text" />
        </div>

        <div className="form-group">
          <label htmlFor="vendor-address">Entity Address:</label>
          <textarea id="vendor-address" type="text" />
        </div>

        
        <div className="form-group">
          <label htmlFor="city">City:</label>
          <input id="city" type="text" />
        </div>

        <div className="form-group">
          <label htmlFor="pin-code">Pin Code:</label>
          <input id="pin-code" type="text" />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country:</label>
          <input id="country" type="text" />
        </div>

        <div className="form-group">
          <label htmlFor="admin-name">Vendor Admin Name:</label>
          <input id="admin-name" type="text" />
        </div>

        <div className="form-group">
          <label htmlFor="designation">Designation:</label>
          <input id="designation" type="text" />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email ID:</label>
          <input id="email" type="email" />
        </div>

        <div className="form-group">
          <label htmlFor="mobile">Mobile No:</label>
          <input id="mobile" type="text" />
        </div>

        <div className="form-group">
          <label htmlFor="valid-from">Valid From:</label>
          <input id="valid-from" type="date" />
          <span> To </span>
          <input id="valid-to" type="date" />
        </div>

        <div className="form-group">
          <label htmlFor="active-flag">Active Flag:</label>
          <select id="active-flag">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="button-group">
        <button type="submit" className="btn-submit">SUBMIT</button>
        <button type="reset" className="btn-cancel">CANCEL</button>
        <button type="button" className="btn-next">NEXT &gt;&gt;</button>
      </div>

      </form>
    </div>
  );
};

export default VendorAdmin;
